# EmailJS Setup for Contact Form

The contact form is configured to send emails to `kndevapp@gmail.com` using EmailJS.

## Quick Setup (5 minutes)

1. **Create EmailJS Account**
   - Go to https://www.emailjs.com/
   - Sign up for free (no credit card needed)

2. **Add Email Service**
   - In EmailJS dashboard, go to "Email Services"
   - Click "Add New Service"
   - Select "Gmail" and connect your `kndevapp@gmail.com` account
   - Note the **Service ID** (e.g., `service_xyz123`)

3. **Create Email Template**
   - Go to "Email Templates"
   - Click "Create New Template"
   - Use this template:

   ```
   Subject: {{subject}} - FinNest Contact Form

   New message from FinNest Contact Form:

   Name: {{from_name}}
   Email: {{from_email}}
   Subject: {{subject}}

   Message:
   {{message}}
   ```

   - Note the **Template ID** (e.g., `template_abc456`)

4. **Get Your Public Key**
   - Go to "Account" → "General"
   - Copy your **Public Key** (e.g., `user_xyz789`)

5. **Update the App**
   - Open `/components/ContactSupportModal.tsx`
   - Replace these values on lines 43-45:
     ```javascript
     service_id: 'service_xyz123', // Your Service ID
     template_id: 'template_abc456', // Your Template ID
     user_id: 'user_xyz789', // Your Public Key
     ```

6. **Test It**
   - Rebuild the app
   - Submit a test message through the contact form
   - Check `kndevapp@gmail.com` for the email

## Free Tier Limits
- 200 emails/month (plenty for a contact form)
- Upgrade available if needed

## Alternative: Use Supabase Edge Functions
If you prefer using Supabase (since you already have it set up), you can create an Edge Function instead. Let me know if you'd prefer this approach!
