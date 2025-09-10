import { GoogleGenAI, Type } from "@google/genai";
import { JWT } from "google-auth-library";
import { exec } from "child_process";
import { promisify } from "util";
import { config } from "dotenv";
import readline from "readline";
import fs from 'fs/promises';
import os from "os";

config();
const raw = await fs.readFile(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf-8");
const keys = JSON.parse(raw);


const asyncExec = promisify(exec);

const platform = os.platform();

const authClient = new JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY, authClient
});

// cmd like mkdir , touch etc...
async function execCommand({ command }) {
    try {
        const { stdout, stderr } = await asyncExec(command);
        if (stderr) {
            console.log("Something went wrong...", stderr);
        } else {
            console.log("Executed CMD", command);

        }
    } catch (error) {
    }
}

// to write content in the particular file
async function writeFile({ path, content }) {
    try {
        const dir = path.substring(0, path.lastIndexOf('/'));
        if (dir) {
            await fs.mkdir(dir, { recursive: true });
        }
        await fs.writeFile(path, content, 'utf8');
        console.log(`File written: ${path}`);
        return `File written: ${path}`;
    } catch (error) {
        console.error(`Failed to write file ${path}:`, error);
        return error.message;
    }
}



const toolFunctions = {
    execCommand,
    writeFile
};

const tools = [
    {
        functionDeclarations: [
            {
                name: "execCommand",
                description: "A Command that needs to create the file, write the file or delete the file or directories ..",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        command: { type: Type.STRING, description: "Terminal Commands to createt he folder strcutre .." },
                    },
                    required: ["command"],
                },
            },
            {
                name: "writeFile",
                description: "Writes content to a specified file path.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        path: { type: Type.STRING, description: "File path to write to" },
                        content: { type: Type.STRING, description: "File content to write" },
                    },
                    required: ["path", "content"],
                },
            }

        ],
    },
];

async function runAgent(inputText) {
    let contents = [
        {
            role: "user",
            parts: [{ text: inputText }],
        },
    ];

    let finalResponse = "";

    while (true) {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                systemInstruction: `You are an Website builder expert. You have to create the frontend of the website by analysing the user Input.
        You have access of tool, which can run or execute any shell or terminal command.
        
        Current user operation system is: ${platform}
        Give command to the user according to its operating system support.

        <-- What is your job -->
        1: Analyse the user query to see what type of website the want to build
        2: Give them command one by one , step by step
        3: Use available tool executeCommand

        // Now you can give them command in following below
        1: First create a folder, Ex: mkdir "calulator"
        2: Inside the folder, create index.html , Ex: touch "calculator/index.html"
        3: Then create style.css same as above
        4: Then create script.js
        5: Then write a code in html file

        You have to provide the terminal or shell command to user, they will directly execute it       
`   ,
                tools
            }
        });

        if (result.functionCalls && result.functionCalls.length > 0) {
            for (const functionCall of result.functionCalls) {
                const { name, args } = functionCall;

                if (!toolFunctions[name]) {
                    console.error(`Unknown function call: ${name}`);
                    continue;
                }

                const toolResponse = await toolFunctions[name](args);

                contents.push({
                    role: "model",
                    parts: [{ functionCall }],
                });

                contents.push({
                    role: "user",
                    parts: [
                        {
                            functionResponse: {
                                name: name,
                                response: { result: toolResponse },
                            },
                        },
                    ],
                });
            }
        } else {
            finalResponse = result.text;
            console.log(`\n[Agent Final Response]:\n${finalResponse}`);
            break;
        }
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.log("🤖 Gemini CLI Agent to make the website!");
rl.setPrompt("> ");
rl.prompt();

rl.on("line", async (line) => {
    const input = line.trim();
    if (input === "exit" || input === "quit") {
        rl.close();
        return;
    }
    try {
        await runAgent(input);
    } catch (err) {
        console.error("❌ Error:", err);
    }

    rl.prompt();
});

rl.on("close", () => {
    console.log("👋 Goodbye!");
    process.exit(0);
});