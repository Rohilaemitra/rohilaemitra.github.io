ROHILA DATA RESTORE FIX

आपका पुराना data delete नहीं हुआ है।
पुरानी website Firebase collections:
- customerDiary
- milkDiary

नई V1 files गलती से इन collections को देख रही थीं:
- customers
- milkRecords

इस ZIP की 3 files GitHub root में upload करके replace करें:
1. customer-diary.js
2. milk-diary.js
3. admin.js

फिर Admin Login करें और Customer Diary / Milk Diary खोलें।
