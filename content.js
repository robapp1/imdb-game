// Updated content of content.js to include Firebase rules compatibility, role validation for 'Start Round', and improved debugging

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const db = firebase.firestore();
const auth = firebase.auth();

const startRound = async (gameId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error("No user is signed in");
            return;
        }

        // Check if the user has sufficient role to start the round
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        if (!userData || userData.role !== 'admin') {
            console.error("User does not have the required role to start the round");
            return;
        }

        // Ensure Firebase rules align with the following operation
        await db.collection('games').doc(gameId).update({
            status: 'round_started',
            roundStartedBy: user.uid,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Round started successfully for game: ${gameId}`);

    } catch (error) {
        console.error("Error starting round: ", error);
    }
};

const joinGame = async (gameId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error("No user is signed in");
            return;
        }

        // Ensure Firebase rules allow this operation
        await db.collection('games').doc(gameId).collection('players').doc(user.uid).set({
            joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log(`User ${user.uid} successfully joined game: ${gameId}`);

    } catch (error) {
        console.error("Error joining game: ", error);
    }
};

const createGame = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error("No user is signed in");
            return;
        }

        const gameRef = await db.collection('games').add({
            createdBy: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'created'
        });

        console.log(`Game created successfully with ID: ${gameRef.id}`);

    } catch (error) {
        console.error("Error creating game: ", error);
    }
};

export { startRound, joinGame, createGame };