# 🚨 Google Workspace Add-on Deployment Troubleshooting

## **Issue: Sidebar Not Showing in Google Sheet**

If your CRM sidebar isn't appearing in Google Sheets, here's the complete troubleshooting guide:

---

## **🔍 STEP-BY-STEP TROUBLESHOOTING**

### **1. Verify Apps Script Project Setup**
1. Go to [Google Apps Script](https://script.google.com)
2. Open your `K&L Recycling CRM` project
3. Check that you have these **exact** files:
   - `Code.gs` (contains the main script)
   - `Sidebar.html` (contains the HTML interface)
   - `appsscript.json` (manifest file)

### **2. Check File Contents**
Ensure `Code.gs` starts with:
```javascript
/** * K&L RECYCLING CRM - UNIFIED BACKEND...
```

Ensure `Sidebar.html` starts with:
```html
<!DOCTYPE html>
<html>
<head>
    <base target="_top">
```

### **3. Verify Manifest Configuration**
Your `appsscript.json` should be:
```json
{
  "timeZone": "America/Chicago",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.send"
  ],
  "addOns": {
    "common": {
      "name": "K&L Recycling CRM",
      "logoUrl": "https://www.gstatic.com/images/branding/product/1x/sheets_48dp.png",
      "useLocaleFromApp": true,
      "homepageTrigger": {
        "runFunction": "onOpen",
        "enabled": true
      }
    },
    "sheets": {
      "homepageTrigger": {
        "runFunction": "onOpen"
      }
    }
  }
}
```

---

## **🚀 DEPLOYMENT PROCESS**

### **Method 1: Test Deployment (Recommended for Debugging)**
1. In Apps Script editor, click **"Deploy"** → **"Test deployments"**
2. Click **"Create new test deployment"**
3. Select **"Add-on"** type
4. **Install** the test version
5. Open your Google Sheet
6. **Extensions** → **Add-ons** → **Manage add-ons**
7. Find **"K&L Recycling CRM (Test Deployment)"**
8. Click **"Install"** → **"Authorize access"**

### **Method 2: Production Deployment**
1. In Apps Script editor, click **"Deploy"** → **"New deployment"**
2. Select **"Add-on"** type
3. Configure:
   - **Description**: `K&L Recycling CRM`
   - **Visibility**: Choose your preference
4. Click **"Deploy"**
5. **Copy the deployment ID** for reference

### **Method 3: Head Deployment (For Development)**
1. In Apps Script editor, click **"Deploy"** → **"Head deployment"**
2. This creates a deployment from your current code
3. Install as above

---

## **🔧 COMMON FIXES**

### **Fix 1: Missing `onOpen` Function**
Ensure your `Code.gs` has this function:
```javascript
function onOpen(e) {
  // Add-on menu is defined in the manifest file
  // This function can be used for other initialization tasks if needed
}
```

### **Fix 2: File Name Issues**
- Apps Script file must be named exactly `Code.gs`
- HTML file must be named exactly `Sidebar.html`
- Manifest must be `appsscript.json`

### **Fix 3: Permissions Reset**
1. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
2. Find your CRM script
3. Click **"Remove access"**
4. Re-install the add-on and re-authorize

### **Fix 4: Browser Cache**
1. Hard refresh your Google Sheet (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache
3. Try in an incognito/private window

---

## **🧪 TESTING YOUR DEPLOYMENT**

### **Test the Sidebar Manually**
1. Open your Google Sheet
2. **Extensions** → **Apps Script**
3. In the script editor that opens, run this in the console:
```javascript
showSidebar()
```
This should open the sidebar if the code is working.

### **Check for Errors**
1. In Apps Script editor, click **"Executions"**
2. Look for any error messages
3. Check the **"Logs"** for debugging info

---

## **📋 VERIFICATION CHECKLIST**

- [ ] Apps Script project has correct files (`Code.gs`, `Sidebar.html`, `appsscript.json`)
- [ ] Manifest has correct `onOpen` trigger configuration
- [ ] Add-on is deployed and installed
- [ ] Permissions are granted for Sheets, Calendar, Gmail
- [ ] Browser cache is cleared
- [ ] Google Sheet is refreshed

---

## **🚨 IF ALL ELSE FAILS**

### **Start Fresh:**
1. Create a **new** Apps Script project
2. Copy your code files again
3. Deploy as a test deployment first
4. Gradually move to production deployment

### **Minimal Test Version:**
Create a simple test version first:
```javascript
// Code.gs
function showSidebar() {
  const html = HtmlService.createHtmlOutput('<h1>Test Sidebar</h1>')
    .setTitle('Test CRM');
  SpreadsheetApp.getUi().showSidebar(html);
}
```

If this works, then add your full code incrementally.

---

## **💡 PRO TIPS**

1. **Always test as "Test Deployment" first** - easier to update
2. **Check the browser console** for JavaScript errors
3. **Use the Apps Script debugger** for server-side issues
4. **Deploy small changes frequently** rather than big updates
5. **Save versions** before major deployments

---

**Need more help?** Share:
- Your Apps Script project URL
- Any error messages you're seeing
- What step is failing

**Your CRM will work once the add-on deployment is correct! 🔧✨**
