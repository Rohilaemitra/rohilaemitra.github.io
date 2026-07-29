import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
export function requireAdmin(callback){onAuthStateChanged(auth,user=>{if(!user){location.replace('login.html');return}callback?.(user)})}
