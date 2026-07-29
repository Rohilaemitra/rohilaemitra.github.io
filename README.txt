ROHILA UNIVERSAL DATA RECOVERY FIX

यह fix सभी पुराने सम्भावित Firebase collections को एक साथ पढ़ती है:

Customer:
- customers
- customerDiary

Milk:
- milkDiary
- milkRecords

GitHub repository की ROOT में इन 3 files को upload करके replace करें:
1. admin.js
2. customer-diary.js
3. milk-diary.js

फिर:
- Admin से Logout करें
- दोबारा Login करें
- Customer Diary और Milk Diary खोलें
- ऊपर status box में हर collection का record count दिखेगा

महत्वपूर्ण:
- firebase.js को replace न करें
- Firebase Console से कोई collection/document delete न करें
- GitHub Pages cache के लिए upload के बाद 2-5 मिनट और एक hard refresh लग सकता है
