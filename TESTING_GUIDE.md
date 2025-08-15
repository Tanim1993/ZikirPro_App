# Seasonal Competitions & Achievement Badges Testing Guide

## Overview
This guide provides step-by-step instructions to test the new seasonal competitions and achievement badges system in your Islamic Zikir Competition app.

## Prerequisites
- App is running (should be accessible at your Replit URL)
- Test users are available:
  - Regular user: `test001` / `Pw001`
  - Organization user: `testorg001` / `Pw001`

## Part 1: Testing Seasonal Competitions

### Step 1: Access Seasonal Competitions
1. **Login** as regular user (`test001` / `Pw001`)
2. **Navigate to Dashboard** - you should see the main dashboard
3. **Click "More"** button in the navigation
4. **Find "Seasonal Competitions"** card (purple/pink gradient with trophy icon)
5. **Click on the card** to access seasonal competitions page

### Step 2: View Available Competitions
You should see 3 sample competitions:
- **Ramadan Blessing 2025** (Purple theme, 1000 zikir target)
- **Hajj Devotion Challenge** (Green theme, 2000 zikir target)  
- **Muharram Reflection** (Blue theme, unlimited zikir)

### Step 3: Test Competition Details
1. **Click "View Details"** on any competition
2. **Verify modal opens** with detailed information:
   - Competition description
   - Start/end dates
   - Registration period
   - Target requirements
   - Prize information
   - Max participants (if applicable)

### Step 4: Join a Competition
1. **Click "Join Competition"** button
2. **Should see success message** or join confirmation
3. **Close modal and try joining another** competition

### Step 5: Test API Endpoints (Optional - Technical)
Open browser console and test these API calls:
```javascript
// Get active competitions
fetch('/api/seasonal-competitions').then(r => r.json()).then(console.log)

// Get specific competition details
fetch('/api/seasonal-competitions/1').then(r => r.json()).then(console.log)

// Join competition (replace ID as needed)
fetch('/api/seasonal-competitions/1/join', {method: 'POST'}).then(r => r.json()).then(console.log)

// Get leaderboard
fetch('/api/seasonal-competitions/1/leaderboard').then(r => r.json()).then(console.log)
```

## Part 2: Testing Achievement Badges System

### Step 6: View Achievement Badges
1. **Open browser console** (F12 → Console tab)
2. **Test badge API endpoints**:
```javascript
// Get all available badges
fetch('/api/achievement-badges').then(r => r.json()).then(console.log)

// Get user's earned badges
fetch('/api/users/me/badges').then(r => r.json()).then(console.log)
```

### Step 7: Test Badge Categories
The system includes badges in 5 categories:
- **Milestone**: First Steps, Century Achiever, Thousand Blessing, Master of Devotion
- **Zikir Performance**: Speed Reciter, Endurance Champion
- **Streak**: Weekly Warrior, Monthly Master
- **Seasonal**: Ramadan Champion, Hajj Pilgrim, New Year Devotee
- **Social**: Community Member, Room Leader

### Step 8: Test Badge Award System
1. **Award a test badge** using console:
```javascript
// Award "First Steps" badge (ID 1) to current user
fetch('/api/users/test001-user-id/badges/1', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({metadata: {reason: 'test_award'}})
}).then(r => r.json()).then(console.log)
```

### Step 9: Test Achievement Processing
```javascript
// Test achievement eligibility checking
fetch('/api/process-achievements', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    eventType: 'count_completed',
    eventData: {
      userTotalCount: 100,
      sessionCount: 50
    }
  })
}).then(r => r.json()).then(console.log)
```

## Part 3: Integration Testing

### Step 10: Test Badge Integration with Zikir Counting
1. **Go to a room** with zikir counting
2. **Complete some zikir counts** (try different amounts)
3. **Check if badges are automatically awarded**
4. **Look for badge notifications** (if implemented)

### Step 11: Test Database Persistence  
1. **Logout and login again**
2. **Check if seasonal competitions still show correctly**
3. **Verify earned badges persist** across sessions

### Step 12: Test Different User Types
1. **Logout as regular user**
2. **Login as organization user** (`testorg001` / `Pw001`)
3. **Access seasonal competitions** - should work the same
4. **Test badge system** with organization account

## Part 4: UI/UX Testing

### Step 13: Mobile Responsiveness
1. **Open browser dev tools** (F12)
2. **Switch to mobile view** (toggle device toolbar)
3. **Test seasonal competitions page** on mobile
4. **Verify cards display properly**
5. **Test modal functionality** on small screens

### Step 14: Visual Design Testing
1. **Check color themes** match Islamic app design
2. **Verify badge icons** display correctly
3. **Test hover effects** on competition cards
4. **Check typography and spacing**

## Part 5: Error Testing

### Step 15: Test Error Handling
1. **Try accessing non-existent competition**:
```javascript
fetch('/api/seasonal-competitions/999').then(r => r.json()).then(console.log)
```
2. **Test invalid badge operations**
3. **Check error messages** are user-friendly

### Step 16: Test Edge Cases
1. **Join same competition twice** - should handle gracefully
2. **Test with missing data** - verify fallbacks work
3. **Test API rate limiting** (if implemented)

## Expected Results

### ✅ Successful Tests Should Show:
- **3 seasonal competitions** displayed with proper themes
- **13+ achievement badges** available across categories
- **Clean, responsive UI** that matches app design
- **Working API endpoints** returning JSON data
- **Proper error handling** for edge cases
- **Mobile-friendly interface**

### ❌ Issues to Report:
- **Competitions not loading** or showing errors
- **Badge system not responding** to API calls
- **UI breaking** on mobile devices
- **Database errors** in browser console
- **Authentication issues** with API calls

## Troubleshooting

### If competitions don't load:
1. **Check browser console** for JavaScript errors
2. **Verify API endpoints** return data
3. **Check network tab** for failed requests

### If badges don't work:
1. **Test API endpoints** manually in console
2. **Check database seeding** completed successfully
3. **Verify user authentication** is working

### Common Issues:
- **CORS errors**: Should be handled by server setup
- **Authentication errors**: Make sure user is logged in
- **Database errors**: Check if seeding completed successfully

## Advanced Testing (Optional)

### Performance Testing:
1. **Load test** with multiple competition joins
2. **Test badge processing** with large datasets  
3. **Check memory usage** during extended sessions

### Security Testing:
1. **Test unauthorized access** to badge endpoints
2. **Verify user isolation** - users can't affect others' badges
3. **Check input validation** on all endpoints

---

This comprehensive testing should validate that the seasonal competitions and achievement badges system is working correctly. If you encounter any issues during testing, note the specific steps and error messages for debugging.