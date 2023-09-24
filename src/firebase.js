import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  getDoc,
  doc,
  addDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
  updateDoc,
  orderBy,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  increment,
  limit,
  startAfter,
} from "firebase/firestore";

import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,

  authDomain: import.meta.env.VITE_AUTH_DOMAIN,

  projectId: import.meta.env.VITE_PROJECT_ID,

  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,

  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,

  appId: import.meta.env.VITE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
export default app;

const postsRef = collection(db, "posts");
let lastPostSnapshot = null;

//Fetches all posts at once
/**
 * //Fetches 10 by 10 posts for neat displaying
//The problem is the q gets updated even where there is only 2 posts renderin the function unusubale
const fetchPosts = async () => {
  let q;
  const posts = [];

  if (lastPostSnapshot) {
    q = query(
      postsRef,
      orderBy("date", "desc"),
      startAfter(lastPostSnapshot),
      limit(10)
    );
  } else {
    q = query(postsRef, orderBy("date", "desc"), limit(10));
  }

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      lastPostSnapshot = querySnapshot.docs[querySnapshot.size - 1];

      querySnapshot.forEach((post) => {
        posts.push({ ...post.data(), id: post.id });
      });
    } else console.log("No more documents to load");
    return posts;
  } catch (error) {
    console.log(error.message);
  }
};
 * 
 */
export const fetchAllPosts = async () => {
  try {
    const posts = [];
    const postsQuery = query(postsRef, orderBy("date", "desc"));
    const postsSnapshot = await getDocs(postsQuery);
    postsSnapshot.forEach((post) =>
      posts.push({ ...post.data(), id: post.id })
    );
    return posts;
  } catch (error) {
    console.log(error.message);
  }
};

//Fetch single post by id
export const fetchPost = async (postId) => {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnapshot = await getDoc(postRef);
    if (postSnapshot.exists()) {
      return { ...postSnapshot.data(), id: postSnapshot.id };
    } else {
      console.log("The document doesn't exist");
    }
  } catch (error) {
    console.log(error.message);
  }
};
//Fetch comments by post id
export const fetchComments = async (postId) => {
  let comments = [];
  const commentsRef = doc(db, "comments", postId);
  const commentsCollection = collection(commentsRef, "comments");

  try {
    const q = query(commentsCollection, orderBy("date", "desc"));
    const commentsSnapshot = await getDocs(q);

    if (!commentsSnapshot.empty) {
      commentsSnapshot.forEach((comment) => {
        comments.push({ ...comment.data(), id: comment.id });
      });
    } else console.log("The post has no comments");

    return comments;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchReplies = async (parentCommentId) => {
  let replies = [];
  const repliesRef = doc(db, "replies", parentCommentId);
  const repliesCollection = collection(repliesRef, "replies");

  try {
    const q = query(repliesCollection, orderBy("date", "desc"));
    const repliesSnapshot = await getDocs(q);
    if (!repliesSnapshot.empty) {
      repliesSnapshot.forEach((reply) => {
        replies.push({ ...reply.data(), id: reply.id });
      });

      return replies;
    } else return;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchCommentsByIds = async (childIds) => {
  try {
    const comments = [];

    for (const childId of childIds) {
      const fetchComment = async (collectionRef, parentId) => {
        const commentRef = doc(collectionRef, parentId, "comments", childId);
        const commentDocSnapshot = await getDoc(commentRef);

        if (commentDocSnapshot.exists()) {
          const comment = commentDocSnapshot.data();
          comments.push({ ...comment, id: childId });
        }
      };

      const fetchCommentsForCollection = async (collectionRef) => {
        const querySnapshot = await getDocs(collectionRef);

        for (const doc of querySnapshot.docs) {
          const parentId = doc.id;
          await fetchComment(collectionRef, parentId);
        }
      };

      await fetchCommentsForCollection(collection(db, "comments"));
    }

    return comments;
  } catch (error) {
    console.error("Error fetching comments by child IDs:", error);
    throw error;
  }
};

//Adding a new post, postData should include: author, title, text
export const addPost = async (postData) => {
  const postsRef = collection(db, "posts");
  const user = auth.currentUser;
  const newPost = {
    author: postData.author,
    title: postData.title,
    text: postData.text,
    date: serverTimestamp(),
    approved: 0,
    condemned: 0,
  };
  if (user) {
    try {
      const newPostRef = await addDoc(postsRef, newPost);
      return newPostRef.id;
    } catch (error) {
      console.log(error.message);
      return null;
    }
  } else {
    return null;
  }
};

export const addComment = async (postId, commentData) => {
  const commentsRef = collection(db, "comments");

  try {
    const postCommentsRef = doc(commentsRef, postId);
    const postCommentsSnapshot = await getDoc(postCommentsRef);

    if (!postCommentsSnapshot.exists()) {
      await setDoc(postCommentsRef, {});
    }

    const newCommentRef = await addDoc(
      collection(postCommentsRef, "comments"),
      {
        author: commentData.author,
        date: serverTimestamp(),
        text: commentData.text,
        upvotes: 0,
        downvotes: 0,
        voteScore: 0,
        parentId: postId,
      }
    );

    return newCommentRef.id;
  } catch (error) {
    console.log(error.message);
  }
};

export const addReply = async (commentId, replyData) => {
  const repliesRef = collection(db, "replies");

  try {
    const postRepliesRef = doc(repliesRef, commentId);
    const postRepliesSnapshot = await getDoc(postRepliesRef);

    if (!postRepliesSnapshot.exists()) {
      await setDoc(postRepliesRef, {});
    }

    const newReplyRef = await addDoc(collection(postRepliesRef, "replies"), {
      author: replyData.author,
      date: serverTimestamp(),
      text: replyData.text,
      upvotes: 0,
      downvotes: 0,
      voteScore: 0,
      parentId: commentId,
    });
    return newReplyRef.id;
  } catch (error) {}
};

export const addVote = async (commentId, parentId, value) => {
  const commentDocRef = doc(db, "comments", parentId, "comments", commentId);
  if (auth.currentUser) {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    try {
      //const userData = fetchUserDataFromFirebase(auth.currentUser.uid);
      const commentSnapshot = await getDoc(commentDocRef);
      if (commentSnapshot.exists()) {
        await updateDoc(commentDocRef, {
          voteScore: increment(value),
        });
      } else {
        const repliesDocRef = doc(
          db,
          "replies",
          parentId,
          "replies",
          commentId
        );
        await updateDoc(repliesDocRef, {
          voteScore: increment(value),
        });
      }
    } catch (error) {
      return error.message;
    }
  } else {
    console.log("User is not logged in");
    return;
  }
};

export const judge = async (postId, judgeType, value) => {
  const postDocRef = doc(db, "posts", postId);
  if (auth.currentUser) {
    try {
      const postSnapshot = await getDoc(postDocRef);
      if (postSnapshot.exists()) {
        await updateDoc(postDocRef, {
          [`${judgeType}`]: increment(value),
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  } else console.log("You need to be logged in");
};

export const fetchPostsByIds = async (postIds) => {
  try {
    const orderedPosts = [];

    for (const postId of postIds) {
      const postDocRef = doc(collection(db, "posts"), postId);
      const postDocSnapshot = await getDoc(postDocRef);

      if (postDocSnapshot.exists()) {
        const postData = postDocSnapshot.data();
        const commentsQuery = query(
          collection(db, "posts", postId, "comments")
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const comments = commentsSnapshot.docs.map((commentDoc) =>
          commentDoc.data()
        );
        orderedPosts.push({
          ...postData,
          id: postDocRef.id,
          comments: comments,
        });
      }
    }

    // Sort posts by date in descending order
    const sortedPosts = orderedPosts.sort((a, b) => b.date - a.date);
    console.log(sortedPosts);
    return sortedPosts;
  } catch (error) {
    console.log(error.message);
  }
};

//Automatic state updating, not usedd for now
export const setUpUserSnapshotListener = (userId, setUser) => {
  const userRef = doc(db, "users", userId);

  const unsubscribe = onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      setUser(userData); // Update the Zustand store with the new user data
    } else {
      setUser(null); // If the user doesn't exist in Firestore, set Zustand user to null
    }
  });

  return unsubscribe;
};

/**
 *
 * AUTHENTIFICATION
 */

//Check if user selected his username
export const checkIfUsernameSelected = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);
    return userSnapshot.data();
  } catch (error) {
    console.log(error.message);
  }
};

// Function to check the availability of the username in Firestore
export const checkUsernameAvailability = async (username) => {
  if (username.length >= 3 && username.length <= 15) {
    const usernameRef = doc(db, "usernames", username);
    const docSnap = await getDoc(usernameRef);
    return !docSnap.exists();
  }
  return false;
};

export const submitUsername = async (username) => {
  const user = auth.currentUser;
  const userDoc = doc(db, "users", user.uid);
  const usernameDoc = doc(db, "usernames", username);

  // posts - post id - collection posts
  // comments
  // approved
  // condemned
  const batch = writeBatch(db);
  batch.set(userDoc, {
    username,
    posts: [],
    comments: [],
    commentReplies: [],
    upvotedComments: [],
    downvotedComments: [],
    approved: [],
    condemned: [],
  });
  batch.set(usernameDoc, { uid: user.uid });
  try {
    await batch.commit();
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchUserDataFromFirebase = async (uid) => {
  try {
    const userDataDocRef = doc(collection(db, "users"), uid);
    const userDataDoc = await getDoc(userDataDocRef);

    if (userDataDoc.exists()) {
      const userData = userDataDoc.data();
      const parsedUserData = { ...userData, uid: userDataDocRef.id };
      return parsedUserData;
    } else {
      console.log("Doc not found");
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const updateUserData = async (uid, newArrayItem, doc1, doc2) => {
  try {
    const userDocRef = doc(db, "users", uid);

    const userData = await getDoc(userDocRef);
    const array1 = userData.get(doc1) || [];
    const array2 = doc2 ? userData.get(doc2) : [];

    const batch = writeBatch(db);

    if (array1)
      if (array1.includes(newArrayItem)) {
        batch.update(userDocRef, {
          [doc1]: arrayRemove(newArrayItem),
        });
      } else {
        batch.update(userDocRef, {
          [doc1]: arrayUnion(newArrayItem),
        });
      }

    if (array2.length > 0) {
      if (array2.includes(newArrayItem)) {
        batch.update(userDocRef, {
          [doc2]: arrayRemove(newArrayItem),
        });
      } else {
        batch.update(userDocRef, {
          [doc2]: arrayUnion(newArrayItem),
        });
      }
    }

    if (array1 || array2) {
      await batch.commit();
    } else {
      console.log("You need to add at least one target to update");
      return;
    }
  } catch (error) {
    console.error(`Error updating arrays:`, error);
  }
};

export const fetchUserByUsername = async (username) => {
  try {
    const userQuery = query(
      collection(db, "users"),
      where("username", "==", username)
    );
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.size > 0) {
      //The usernames are unique so there is always at most one document
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      return userData;
    } else {
      //User not found
      console.log("User with username", username, "not found");
      return null;
    }
  } catch (error) {
    console.log(error.message);
    return null;
  }
};
