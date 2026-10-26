# Інструкція зі збірки Android App Bundle (.aab) для Google Play Console

> **Проєкт**: NUTRIQ — Intelligent Nutrition  
> **Package Name**: `app.nutriq.plate`  
> **Цільова технологія**: Trusted Web Activity (TWA, Google AndroidBrowserHelper 2.5.0)  
> **Сертифікат підпису**: `android/keystore/release.keystore` (дійсний до 2054 року)  
> **SHA-256 Fingerprint**: `D4:C2:8B:F0:39:AF:DE:84:DB:AD:AF:70:9C:B1:88:D3:CB:BC:40:42:D3:F5:99:9A:DB:65:D4:7C:E9:FB:90:8E`  

---

## Варіант 1: Збірка через Android Studio (Найпростіший, 1 клік)

Оскільки на вашому комп'ютері вже встановлено **Android Studio** (`C:\Program Files\Android\Android Studio`), збірка виконується в графічному режимі:

1. Запустіть **Android Studio**.
2. Оберіть **File ➔ Open** та вкажіть теку:
   `C:\Projects\Antigravity\Smart_Daily_Plate\android`
3. Зачекайте завершення автоматичної індексації та синхронізації Gradle (1-2 хвилини).
4. У верхньому меню оберіть:
   **Build ➔ Generate Signed Bundle / APK...**
5. Оберіть **Android App Bundle** ➔ натисніть **Next**.
6. У полях підпису вкажіть (або вони підтягнуться автоматично з `build.gradle`):
   - **Key store path**: `C:\Projects\Antigravity\Smart_Daily_Plate\android\keystore\release.keystore`
   - **Key store password**: `NutriqRelease2026!`
   - **Key alias**: `nutriq_release_key`
   - **Key password**: `NutriqRelease2026!`
7. Оберіть варіант збірки **release** ➔ натисніть **Create**.
8. Готовий файл з'явиться за шляхом:
   `C:\Projects\Antigravity\Smart_Daily_Plate\android\app\release\app-release.aab`

---

## Варіант 2: Завантаження в Google Play Console

1. Перейдіть до [Google Play Console](https://play.google.com/console).
2. Створіть новий додаток з назвою **NUTRIQ — Daily Nutrition**.
3. У розділі **Release ➔ Production (або Closed testing)** натисніть **Create new release**.
4. Завантажте готовий файл `app-release.aab`.
5. Додайте Feature Graphic (`public/play_store_feature_graphic_1024x500.png`) та 4 скріншоти з папки `public/store_assets/`.
6. Скопіюйте готові описи з файлу [`play_store_metadata.md`](file:///C:/Projects/Antigravity/Smart_Daily_Plate/play_store_metadata.md).
7. У розділі Data Safety вкажіть URL видалення акаунту:  
   `https://smart-daily-plate.vercel.app/delete-account.html`
8. Відправте на розгляд модерації Google!
