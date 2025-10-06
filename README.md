ChatKit is a batteries-included framework for building high-quality, AI-powered chat experiences. It’s designed for developers who want to add advanced conversational intelligence to their apps fast—with minimal setup and no reinventing the wheel. ChatKit delivers a complete, production-ready chat interface out of the box.

**Key features include:**

- **Deep UI customization** so that ChatKit feels like a first-class part of your app
- **Built-in response streaming** for interactive, natural conversations
- **Tool and workflow integration** for visualizing agentic actions and chain-of-thought reasoning
- **Rich interactive widgets** rendered directly inside the chat
- **Attachment handling** with support for file and image uploads
- **Thread and message management** for organizing complex conversations
- **Source annotations and entity tagging** for transparency and references

Simply drop the ChatKit component into your app, configure a few options, and you're good to go.

### What makes ChatKit different?

ChatKit is a framework-agnostic, drop-in chat solution.
You don’t need to build custom UIs, manage low-level chat state, or patch together various features yourself.
Just add the ChatKit component, give it a client token, and customize the chat experience as needed, no extra work needed.

## Quickstart

1. Generate a client token on your server.

   ```python
   from fastapi import FastAPI
   from pydantic import BaseModel
   from openai import OpenAI
   import os

   app = FastAPI()
   openai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

   @app.post("/api/chatkit/session")
   def create_chatkit_session():
       session = openai.chatkit.sessions.create({
         # ...
       })
       return { client_secret: session.client_secret }
   ```

2. Install the React bindings

   ```bash
   npm install @openai/chatkit-react
   ```

3. Add the ChatKit JS script to your page

   ```html
   <script
     src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
     async
   ></script>
   ```

4. Render ChatKit

   ```tsx
   import { ChatKit, useChatKit } from '@openai/chatkit-react';

   export function MyChat() {
     const { control } = useChatKit({
       api: {
         async getClientSecret(existing) {
           if (existing) {
             // implement session refresh
           }

           const res = await fetch('/api/chatkit/session', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
           });
           const { client_secret } = await res.json();
           return client_secret;
         },
       },
     });

   return <ChatKit control={control} className="h-[600px] w-[320px]" />;
  }
  ```

### React Native (Expo) preview

Experimental support for Expo and bare React Native apps lives in the `@openai/chatkit-react-native` package. The library ships
streaming HTTP helpers, WebRTC wrappers, voice primitives, and opinionated UI building blocks (`ChatList`, `ChatComposer`).

- Install the package alongside the recommended polyfills:

  ```bash
  pnpm add @openai/chatkit-react-native react-native-polyfill-globals react-native-url-polyfill react-native-get-random-values base-64
  ```

- Import the polyfills at the top of your app entry point before rendering any ChatKit component:

  ```ts
  import 'react-native-polyfill-globals/auto';
  import 'react-native-url-polyfill/auto';
  import 'react-native-get-random-values';
  import 'base-64';
  ```

Read the [React Native getting started guide](docs/react-native/getting-started.md) for details on Expo networking, WebRTC
signalling, voice support, and testing recommendations.

### Testing the React Native package

Run the package build to ensure the TypeScript sources compile before publishing:

```bash
pnpm --filter @openai/chatkit-react-native build
```

The command bundles the entry points with `tsup` and validates the generated type declarations. If you are iterating on the
package locally, you can append `--watch` to rebuild on file changes.

## License

This project is licensed under the [Apache License 2.0](LICENSE).
