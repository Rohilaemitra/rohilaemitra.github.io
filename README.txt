ROHILA FINAL COMBINED FIX

GitHub repository की root में इन 7 files को upload/replace करें:

1. admin.html
2. admin.js
3. customer-diary.js
4. milk-diary.js
5. secret.html
6. secret.js
7. storage.rules

यह combined fix:
- Admin Dashboard में Secret Gallery जोड़ती है
- पुराने Customer Diary collection (customerDiary) से data दिखाती है
- पुराने Milk Diary collection (milkDiary) से data दिखाती है
- Secret photos के लिए Firebase Storage rules देती है

महत्वपूर्ण:
storage.rules को GitHub में upload करने के साथ Firebase Console > Storage > Rules में भी paste करके Publish करना होगा।
Firebase Firestore का पुराना data delete नहीं करना है।
