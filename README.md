

# 🤖 Gemini CLI Website Builder Agent

This is a **Node.js CLI agent** powered by **Google Gemini** and authenticated via **Google Cloud Service Account**, designed to build frontend websites by interpreting user input and generating/executing terminal commands step-by-step.

The agent helps scaffold folders, create files (HTML, CSS, JS), and write content to files based on your input.

---

## 🛠 Features

* Interact with Google Gemini 2.5 Flash Model via CLI
* Automatically generate and execute:

  * Terminal commands (`mkdir`, `touch`, etc.)
  * File creation and writing (`index.html`, `style.css`, etc.)
* Cross-platform support using `os.platform()`
* Uses `dotenv` and Google Service Account for secure API access

---

## 🚀 Usage Example

```
🤖 Gemini CLI Agent to make the website!
> I want to build a calculator app
```

---


## 📦 Installation

1. **Clone the repo**

```bash
git clone https://github.com/parasnikum/gemini-cli-agent.git
cd gemini-cli-agent
```

2. **Install dependencies**

```bash
npm install
```

3. **Create `.env` file**

```env
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

> 📝 Replace `your-gemini-api-key` with your actual API key from Google AI Studio.

4. **Add your Service Account JSON**

Download a service account key from [Google Cloud Console](https://console.cloud.google.com/) and save it as `service-account.json` in the root directory.

---

## ▶️ Running the CLI Agent

```bash
node index.js
```

Then type your prompt:

```bash
> Build a personal portfolio website
```

The agent will generate the folder structure and files, and begin writing content using Gemini.

---

## 📌 Dependencies

* [`@google/genai`](https://www.npmjs.com/package/@google/genai)
* [`google-auth-library`](https://www.npmjs.com/package/google-auth-library)
* `dotenv`
* `readline`
* `fs/promises`
* `os`
* `child_process` (via `util.promisify`)

---

## ⚠️ Limitations

* Only works with shell/terminal commands supported by your OS.
* Commands are executed directly; be cautious with inputs.
* Currently focused on **frontend project scaffolding** (HTML, CSS, JS).

---
