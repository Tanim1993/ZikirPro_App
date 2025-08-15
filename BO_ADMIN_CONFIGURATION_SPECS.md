# 🛠️ BO Admin Portal Configuration Specifications

## 🎯 **Complete BO Configuration System Design**

### **Admin Portal Structure**
```
Admin Portal Main Navigation:
├── Dashboard (Analytics Overview)
├── User Management
├── Game Configuration
│   ├── Level System (1-50)
│   ├── Currency & Points
│   ├── Badge Management
│   ├── Daily Quests
│   └── Islamic Practices
├── Competition Management
├── Economy Settings
├── Content Management
└── System Settings
```

---

## 🏆 **Level System Configuration (1-50)**

### **BO Interface: Level Management**
```html
<!-- Admin Level Configuration Panel -->
<div class="level-config-panel">
  <h2>Level System Configuration (1-50)</h2>
  
  <table class="level-config-table">
    <thead>
      <tr>
        <th>Level</th>
        <th>Title</th>
        <th>Points Required</th>
        <th>Room Limit</th>
        <th>Coin Multiplier</th>
        <th>Special Features</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <!-- Levels 1-50 rows -->
      <tr>
        <td>1</td>
        <td><input value="Seeker (مطلب)" /></td>
        <td><input type="number" value="0" /></td>
        <td><input type="number" value="1" /></td>
        <td><input type="number" value="1.0" step="0.1" /></td>
        <td><textarea>Basic features only</textarea></td>
        <td><button>Save</button></td>
      </tr>
      <!-- Repeat for all 50 levels -->
    </tbody>
  </table>
  
  <div class="bulk-actions">
    <button>Apply Template</button>
    <button>Export Configuration</button>
    <button>Import Configuration</button>
  </div>
</div>
```

### **Level Configuration Database Schema**
```sql
CREATE TABLE level_configuration (
  level INTEGER PRIMARY KEY,
  title_en VARCHAR(100),
  title_ar VARCHAR(100),
  points_required INTEGER,
  room_creation_limit INTEGER,
  coin_multiplier DECIMAL(3,2),
  special_features TEXT[],
  unlock_message TEXT,
  level_image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🪙 **Currency & Points Configuration**

### **BO Interface: Currency Management**
```html
<div class="currency-config">
  <h2>Currency System Configuration</h2>
  
  <div class="currency-rates">
    <h3>Earning Rates</h3>
    <div class="rate-config">
      <label>Zikir Count Rate:</label>
      <input type="number" value="1" /> points per 
      <input type="number" value="10" /> zikir
    </div>
    
    <div class="rate-config">
      <label>Daily Login Bonus:</label>
      <input type="number" value="25" /> points
    </div>
    
    <div class="rate-config">
      <label>Competition Participation:</label>
      <input type="number" value="50" /> points
    </div>
  </div>
  
  <div class="seasonal-multipliers">
    <h3>Seasonal Multipliers</h3>
    <div class="multiplier-config">
      <label>Ramadan Multiplier:</label>
      <input type="number" value="2.0" step="0.1" />
    </div>
    <div class="multiplier-config">
      <label>Hajj Season Multiplier:</label>
      <input type="number" value="1.5" step="0.1" />
    </div>
  </div>
</div>
```

### **Currency Configuration Schema**
```sql
CREATE TABLE currency_configuration (
  id SERIAL PRIMARY KEY,
  activity_type VARCHAR(100),
  base_points INTEGER,
  multiplier DECIMAL(3,2) DEFAULT 1.0,
  level_requirement INTEGER DEFAULT 1,
  seasonal_bonus DECIMAL(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🏆 **Badge Management System**

### **BO Interface: Badge Configuration**
```html
<div class="badge-management">
  <h2>Badge System Configuration</h2>
  
  <div class="badge-categories">
    <div class="category-tabs">
      <button class="active">Zikir Mastery</button>
      <button>Islamic Practices</button>
      <button>Community</button>
      <button>Seasonal</button>
    </div>
    
    <div class="badge-config-form">
      <h3>Create/Edit Badge</h3>
      <form>
        <input type="text" placeholder="Badge Name (English)" />
        <input type="text" placeholder="Badge Name (Arabic)" />
        <textarea placeholder="Description"></textarea>
        <input type="file" accept="image/*" /> <!-- Badge Image -->
        
        <h4>Achievement Criteria</h4>
        <select name="criteria_type">
          <option>Zikir Count</option>
          <option>Daily Streak</option>
          <option>Islamic Practice</option>
          <option>Community Activity</option>
        </select>
        <input type="number" placeholder="Target Value" />
        
        <h4>Rewards</h4>
        <input type="number" placeholder="Points Reward" />
        <input type="number" placeholder="Coin Reward" />
        
        <button type="submit">Save Badge</button>
      </form>
    </div>
  </div>
  
  <div class="existing-badges">
    <h3>Existing Badges</h3>
    <table class="badges-table">
      <thead>
        <tr>
          <th>Badge</th>
          <th>Category</th>
          <th>Criteria</th>
          <th>Reward</th>
          <th>Earned By</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <!-- Badge rows populated dynamically -->
      </tbody>
    </table>
  </div>
</div>
```

---

## 🎯 **Daily Quest Configuration**

### **BO Interface: Quest Management**
```html
<div class="quest-management">
  <h2>Daily Quest Configuration</h2>
  
  <div class="quest-builder">
    <h3>Create Daily Quest</h3>
    <form class="quest-form">
      <input type="text" placeholder="Quest Name" />
      <textarea placeholder="Quest Description"></textarea>
      
      <div class="quest-type">
        <label>Quest Type:</label>
        <select>
          <option>Zikir Count</option>
          <option>Islamic Practice</option>
          <option>Community Activity</option>
          <option>Time-based Challenge</option>
        </select>
      </div>
      
      <div class="quest-parameters">
        <label>Target:</label>
        <input type="number" placeholder="e.g., 100 zikir" />
        
        <label>Time Limit:</label>
        <select>
          <option>All Day</option>
          <option>Before 10 AM</option>
          <option>After Maghrib</option>
          <option>Custom</option>
        </select>
      </div>
      
      <div class="quest-rewards">
        <label>Points Reward:</label>
        <input type="number" value="25" />
        
        <label>Bonus Multiplier:</label>
        <input type="number" value="1.0" step="0.1" />
      </div>
      
      <div class="quest-availability">
        <label>Available for Levels:</label>
        <input type="number" placeholder="Min Level" />
        <span>to</span>
        <input type="number" placeholder="Max Level" />
      </div>
      
      <button type="submit">Create Quest</button>
    </form>
  </div>
  
  <div class="active-quests">
    <h3>Active Daily Quests</h3>
    <div class="quest-list">
      <!-- Quest cards with edit/delete options -->
    </div>
  </div>
</div>
```

---

## 🕌 **Islamic Practice Configuration**

### **BO Interface: Islamic Practice Management**
```html
<div class="islamic-practice-config">
  <h2>Islamic Daily Practice Configuration</h2>
  
  <div class="practice-categories">
    <div class="practice-form">
      <h3>Add Islamic Practice</h3>
      <form>
        <input type="text" placeholder="Practice Name (English)" />
        <input type="text" placeholder="Practice Name (Arabic)" />
        <textarea placeholder="Description & Benefits"></textarea>
        
        <div class="practice-timing">
          <label>Recommended Time:</label>
          <select>
            <option>Any Time</option>
            <option>After Fajr</option>
            <option>Before Maghrib</option>
            <option>After Isha</option>
            <option>Friday Only</option>
            <option>Night Time</option>
          </select>
        </div>
        
        <div class="practice-rewards">
          <label>Points Reward:</label>
          <input type="number" value="50" />
          
          <label>Streak Bonus:</label>
          <input type="number" value="10" /> points per consecutive day
        </div>
        
        <div class="practice-verification">
          <label>Verification Method:</label>
          <select>
            <option>Self-Confirmation</option>
            <option>Community Verification</option>
            <option>Time-based Check</option>
          </select>
        </div>
        
        <button type="submit">Add Practice</button>
      </form>
    </div>
  </div>
  
  <div class="existing-practices">
    <h3>Configured Islamic Practices</h3>
    <table class="practices-table">
      <thead>
        <tr>
          <th>Practice</th>
          <th>Timing</th>
          <th>Points</th>
          <th>Completions Today</th>
          <th>Active</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Surah Al-Kahf (Friday)</td>
          <td>Friday Only</td>
          <td>100</td>
          <td>24</td>
          <td>✅</td>
          <td><button>Edit</button> <button>Delete</button></td>
        </tr>
        <!-- More practice rows -->
      </tbody>
    </table>
  </div>
</div>
```

---

## 🏪 **Room Economy Configuration**

### **BO Interface: Room Limits & Pricing**
```html
<div class="room-economy-config">
  <h2>Room Creation Economy</h2>
  
  <div class="level-room-limits">
    <h3>Room Limits by Level</h3>
    <table class="room-limits-table">
      <thead>
        <tr>
          <th>Level Range</th>
          <th>Free Rooms</th>
          <th>Additional Slot Price</th>
          <th>Max Purchasable</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1-10</td>
          <td><input type="number" value="1" /></td>
          <td>$<input type="number" value="2.99" step="0.01" /></td>
          <td><input type="number" value="2" /></td>
        </tr>
        <!-- More level ranges -->
      </tbody>
    </table>
  </div>
  
  <div class="room-purchase-packages">
    <h3>Room Purchase Packages</h3>
    <div class="package-config">
      <div class="package">
        <label>+1 Room Slot:</label>
        <input type="number" value="2.99" step="0.01" />
      </div>
      <div class="package">
        <label>+3 Room Slots:</label>
        <input type="number" value="6.99" step="0.01" />
      </div>
      <div class="package">
        <label>Unlimited Rooms:</label>
        <input type="number" value="19.99" step="0.01" />
      </div>
    </div>
  </div>
</div>
```

---

## 📊 **Real-time Analytics Dashboard**

### **BO Analytics Interface**
```html
<div class="admin-analytics">
  <h2>Real-time Platform Analytics</h2>
  
  <div class="key-metrics">
    <div class="metric-card">
      <h3>Active Users</h3>
      <div class="metric-value">1,247</div>
      <div class="metric-change">+12% today</div>
    </div>
    
    <div class="metric-card">
      <h3>Level Distribution</h3>
      <canvas id="levelChart"></canvas>
    </div>
    
    <div class="metric-card">
      <h3>Islamic Practice Completion</h3>
      <div class="practice-stats">
        <div>Surah Al-Kahf: 89%</div>
        <div>Daily Prayers: 76%</div>
        <div>Sayyidul Istighfar: 45%</div>
      </div>
    </div>
  </div>
  
  <div class="detailed-analytics">
    <div class="chart-section">
      <h3>User Progression Over Time</h3>
      <canvas id="progressionChart"></canvas>
    </div>
    
    <div class="engagement-metrics">
      <h3>Engagement Metrics</h3>
      <table>
        <tr>
          <td>Daily Quest Completion Rate</td>
          <td>73%</td>
        </tr>
        <tr>
          <td>Average Session Duration</td>
          <td>12 minutes</td>
        </tr>
        <tr>
          <td>Competition Participation</td>
          <td>68%</td>
        </tr>
      </table>
    </div>
  </div>
</div>
```

---

## 🔄 **API Endpoints for BO Configuration**

### **Level Management APIs**
```javascript
// Level Configuration
POST   /api/admin/levels/configure
GET    /api/admin/levels/configuration
PUT    /api/admin/levels/:level/update
DELETE /api/admin/levels/:level/reset

// Currency Management  
POST   /api/admin/currency/rates/update
GET    /api/admin/currency/analytics
PUT    /api/admin/currency/multipliers/seasonal

// Badge Management
POST   /api/admin/badges/create
GET    /api/admin/badges/list
PUT    /api/admin/badges/:id/update
DELETE /api/admin/badges/:id/delete

// Quest Management
POST   /api/admin/quests/create
GET    /api/admin/quests/active
PUT    /api/admin/quests/:id/update
POST   /api/admin/quests/:id/toggle

// Islamic Practice Management
POST   /api/admin/practices/create
GET    /api/admin/practices/list
PUT    /api/admin/practices/:id/update
GET    /api/admin/practices/analytics
```

This comprehensive BO configuration system gives you complete control over every aspect of the gamification system while ensuring seamless integration between admin settings and user experience.