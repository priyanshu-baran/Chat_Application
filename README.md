# Chat Application using MERN Stack and Firebase Authentication

<br/>

## Introduction (❁´◡`❁):

This is a cool web-based real-time chat application with both Firebase Authentication as well as MERN Stack implementation. In this I have used a pre-made tailwind css template to make my work fast and then changed it according to my requirement. I have enabled both google sign-in and email/password signup method for firebase authentication. I have also stored all the users, their online/offline status and all the messages in the MongoDB Atlas database.

Although there are still more features which I am looking forward to add like, file and emoji sharing along with the messages, dynamically editing profile image and profile about and much more.

<!-- Now without wasting more time give it a short using the below provided demo link and then share your experience in this [post](). -->

---

## Demo 👀

You can view the demo of this website by following [this link](https://web-based-real-time-chat-app.netlify.app/) **(For better user experience don't open it in your mobile phone)**. Or else you can also view its demonstration video [here](https://clipchamp.com/watch/B3gtuU7A1nO).<br> For hosting, I have used [Netlify](https://app.netlify.com) to host the frontend and [Render](https://dashboard.render.com/) and to host backend.

---

## ✅ Steps to start with:

### Firstly ensure that you are ready with these things:

- Node installed in your system (check it by running either `node -v` or `npm -v` in your terminal)
- URI String for MongoDB Atlas connection from [here](https://cloud.mongodb.com/v2/63c0084fb7eec9687474067f#/clusters/detail/Cluster-1/connect?clusterId=Cluster-1)
- [Firebase](https://console.firebase.google.com/) Account

### After that:

1. Now clone this repo and navigate to the cloned folder.
   > git clone https://github.com/priyanshu-baran/Chat_Application.git && cd Chat_Application
2. Open that cloned folder in VS Code and before moving further, simply open two terminals one with `frontend` folder and other with `backend` folder.
3. Install all the dependencies needed for this project by running this command (in both terminals seperately).
   > npm install
4. Then do the required changes needed before running it, like replacing all the stuffs that you have, with mine one. For this you can simply create one `.env` file inside the backend folder and add all that stuffs right inside it with appropriate name.
   > **_Note:_** I have already defined these terms so be-careful so that you use that names only or else change in all places wherever it is used according to your wish.
5. Now setup your firebase project and after that select your project and navigate to the [Sign-in method](https://console.firebase.google.com/project/chat-application-5f522/authentication/providers) tab under Authentication section and enable Email/Password and Google sign-in provider.
   > **_Note:_** If you want to use your firebase project to connect then you have to change the `initializeApp` object declared in the frontend/src/index.js file with your own. Or else keep it like that only and let me see who are actually using this application 👀 (Just for fun...😜😜😝).
6. Now, since all setup part is done so let's move ahead by running this command, again in both the terminals seperately.
   > npm start
7. If both of your terminals runs smoothly without showing any error, then congrats 🥳🎉 you are in good state, else re-config your setup and try again 🤕🫣.

---

## How to tweak this project for your own uses

Since this is an example project, I'd encourage you to clone and rename this project and also change that `firebase initializeApp object` with your own to use for your own purposes. It's a good web-based chat application to start with.

---

## Contributing 📝

If you would like to contribute to this repo `Chat_Application` then, please fork the repository and submit a pull request with your changes. Contributions are welcome and encouraged!

---

## Like this project? 🤩

If you are feeling generous, buy me a coffee...!!! ☕<br/>

<a href="https://www.buymeacoffee.com/priyanshubaran" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

---

### Happy Coding...!! 👨🏽‍💻👨🏽‍💻
