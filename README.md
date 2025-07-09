## 🌐 PathAble: Make Every Path Possible

---

## 💡 Why We Built This

> *"Is there a wheelchair ramp at that bus stop?"*
> *"Will I be able to get into this building on my own?"*

In most cities, there's **no centralized record** of accessibility infrastructure. People with mobility needs are left guessing — risking safety, dignity, and inclusion.

🚫 No clear information
🚫 Reviews full of spam or paid bias
🚫 No follow-up or accountability

**PathAble solves this** with a civic-tech approach combining:

* ✨ **Crowdsourced reports**
* ✅ **Verified NGO moderation**
* 📍 **Map-based visual interface**
* 🏅 **Gamified community contributions**

---

## ✨ Key Features

### 📎 Report Accessibility Issues

Users can:

* Add a report with **place name, address, description, images, and map location**
* Auto-fill details using **reverse geocoding**
* Attach **Cloudinary-hosted** images for easy access and scalability

### 🔍 Live Place Search

Integrated with:

* **OpenStreetMap’s Nominatim** for place search and reverse geocoding
* **GeoNames** for nearby locations

### 🧠 Image Validation

* Image verification for ramps, elevators, etc. *(optional and experimental)*

### 🗺️ NGO Zones & Tools

* NGOs can **draw zones** on a map using Leaflet Draw
* Each zone tracks:

  * Number of verified reports
  * User activity within the area

### 🔐 Role-Based Access

* Normal Users: Add/view reports, earn badges
* NGOs: Verify, mark spam, manage zone-specific data

### 🏅 Badges and Leaderboards

* Verified Reporter
* Top Contributor
* NGO of the Week

### Premium Features Enables

* get verified for taking premium
* Access for every report others publish

---

## 📈 Tech Stack

| Frontend                 | Backend & APIs          | Others                           |
| ------------------------ | ----------------------- | -------------------------------- |
| React.js + React Leaflet | Node.js + Express.js    | Cloudinary for Image Hosting     |
| Tailwind CSS             | MongoDB (Mongoose ODM)  | Hugging Face / Teachable Machine |
| React-Leaflet-Draw       | OpenStreetMap, GeoNames | Firebase Auth (optional)         |

---

Presentation Link : https://docs.google.com/presentation/d/1AkCl7vfh2Lcghyx1V10DQSdzTA76TUf2/edit?usp=sharing&ouid=109757433795874036217&rtpof=true&sd=true

## 📅 Setup Instructions

1. Clone the repo
2. Setup your `.env` file:

   ```
   CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```
3. Install dependencies:

   ```bash
   npm install
   ```
4. Start frontend and backend separately

---

## 🚪 Target Users

* 👨‍🦽 Individuals with disabilities
* 🧑‍🎓 Students & volunteers collecting field reports
* 🏢 NGOs focused on accessibility
* 🏙️ City planners and local authorities

---

## 🌍 Impact

**PathAble promotes digital accessibility as a shared civic responsibility.**

Unlike anonymous review apps, every report here:

* Is **linked to a real user**
* Can be **verified by NGOs**
* Is **visible on maps by zone or place**

This makes the data usable for:

* Accessibility audits
* Urban planning
* Civic policy making
* Real-time help for travelers and commuters

---

## 🤾 Vision

> "PathAble: Make Every Path Possible."

This is not just an app—it's a **movement** toward visibility, dignity, and digital-first civic inclusion.

Help us build **accessible paths**, one verified report at a time.

---

## 👥 Contributing

PRs, feedback, and testers are welcome!
