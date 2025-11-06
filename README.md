# Caltech Longevity Points Shop

A standalone, offline-first rewards system for the Caltech Longevity Club. Members earn and redeem longevity points for exclusive rewards.

## Features

- **Autonomous**: No internet or external services required
- **One-command startup**: `npm run start`
- **Hybrid data storage**: SQLite for shop data + optional Notion integration for participants and points
- **Code-based authentication**: Secure access codes instead of email/password
- **Role-based access**: Participant and Operator roles
- **Points ledger**: Single source of truth for all point transactions
- **Rewards shop**: Browse and redeem rewards with points
- **Admin panel**: Manage participants, rewards, and redemption requests
- **Notion integration**: Sync participants and points from Notion databases
- **Participant management**: Create users and generate access codes
- **CSV import/export**: Batch operations for points and data export
- **Caltech branding**: Clean white background with Caltech Orange (#FF6C0C) accents

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start the application (creates database, runs migrations, starts server)
npm run start
\`\`\`

The application will be available at `http://localhost:3000`

## 🔑 First Login

After running `npm run start`, the console will display test access codes:

\`\`\`
🔑 Test Access Codes:
   Admin: ADMIN2025
   Alice: ALICE2025 (150 points)
   Bob: BOB2025 (200 points)
   Guest: GUEST001, GUEST002
\`\`\`

### Admin Access
1. Go to `http://localhost:3000/login`
2. Enter code: **ADMIN2025**
3. Access admin panel at `http://localhost:3000/admin`

### Participant Access
1. Go to `http://localhost:3000/login`
2. Enter code: **ALICE2025** or **BOB2025**
3. View dashboard with points balance

## 🔗 Notion Integration

The system supports optional Notion integration for syncing participants and points data.

### Setup Notion Integration

1. **Create Notion Integration**
   - Go to https://www.notion.so/my-integrations
   - Click "New integration"
   - Give it a name (e.g., "Caltech Longevity Shop")
   - Copy the "Internal Integration Token" (starts with `secret_`)

2. **Prepare Notion Databases**
   
   **Participants Database** should have these properties:
   - `Name` or `Имя` (Title)
   - `Email` or `E-mail` (Email)
   - `Status` or `Статус` (Select: active/inactive)
   - `Role` or `Роль` (Select: participant/operator)

   **Points Ledger Database** should have these properties:
   - `Email` or `Participant Email` (Email or Text)
   - `Delta` or `Points` (Number)
   - `Reason` or `Описание` (Text)
   - `Source` or `Источник` (Select: checkin/manual/redeem/adjustment/refund)
   - `Date` or `Дата` (Date)

3. **Share Databases with Integration**
   - Open each database in Notion
   - Click "..." menu → "Add connections"
   - Select your integration

4. **Get Database IDs**
   - Open database in Notion
   - Copy the URL: `https://notion.so/workspace/DATABASE_ID?v=...`
   - The `DATABASE_ID` is the part between workspace name and `?v=`

5. **Configure in Admin Panel**
   - Log in as admin (ADMIN2025)
   - Go to Admin Panel → **Notion Integration** tab
   - Enter your Notion API Key
   - Click "Test Connection" to verify
   - Enter Participants Database ID
   - Enter Points Ledger Database ID
   - Enable "Enable Notion Sync"
   - Click "Save Configuration"

### Syncing Data

**Manual Sync:**
- Go to Admin Panel → Notion Integration
- Click "Sync Participants" to import users from Notion
- Click "Sync Ledger" to import points transactions
- Click "Full Sync" to sync both

**How Sync Works:**
- **Participants**: Creates or updates participants based on email
- **Ledger**: Imports new point transactions (checks for duplicates by date/amount/reason)
- **Sync Logs**: View history of all sync operations with success/error status

### Data Flow

\`\`\`
Notion Databases → Sync → SQLite → Shop Interface
                                  ↓
                            Redemptions & Rewards (SQLite only)
\`\`\`

- **Participants & Points**: Can be managed in Notion and synced to shop
- **Rewards & Redemptions**: Managed only in the shop (SQLite)
- **Hybrid approach**: Use Notion for data entry, shop for redemption workflow

## Managing Participants & Access Codes

### Creating New Participants

1. Log in as admin (ADMIN2025)
2. Go to Admin Panel → **Participants** tab
3. Click "Добавить участника" (Add Participant)
4. Fill in the form:
   - Name
   - Email
   - Role (Participant/Operator)
   - Initial Points (optional)
5. System automatically generates an access code
6. Copy the code and share it with the participant

### Generating Additional Access Codes

1. In Admin Panel → **Participants** tab
2. Scroll to "Коды доступа" (Access Codes) section
3. Click "Создать код" (Create Code)
4. Choose:
   - Participant (or leave empty for guest code)
   - Role (Participant/Operator)
   - Expiration (days)
5. Click "Создать код" (Create Code)
6. Copy the generated code using the copy button

### Access Code Types

- **Personal Codes**: Linked to specific participant
- **Guest Codes**: For new participants (creates profile on first use)
- **Operator Codes**: Grants admin panel access

## Project Structure

\`\`\`
├── app/
│   ├── admin/              # Admin panel
│   ├── dashboard/          # User dashboard
│   ├── login/              # Login page
│   └── api/                # API routes
├── components/             # React components
├── lib/
│   ├── db.ts              # SQLite database functions
│   ├── notion.ts          # Notion API integration
│   ├── auth.ts            # Authentication utilities
│   └── types.ts           # TypeScript types
├── migrations/            # SQL migration files
├── scripts/
│   └── bootstrap.js       # Database initialization script
├── storage/               # SQLite database (created on first run)
└── public/uploads/        # Uploaded reward images
\`\`\`

## Database Schema

### participants
- User accounts with name, email, status, and role

### ledger
- **Single source of truth** for all point transactions
- Balance calculated as `SUM(delta)` per participant
- Sources: checkin, manual, redeem, adjustment, refund

### rewards
- Available rewards with cost, category, stock, and description

### redemption_requests
- Redemption requests with status tracking (pending → approved → fulfilled)

### access_codes
- Authentication codes with role assignment and expiration

### notion_config
- Notion API configuration and sync settings

### notion_sync_log
- History of all Notion sync operations

## User Roles

### Participant
- View balance and transaction history
- Browse rewards catalog
- Redeem rewards (creates pending request)
- Track redemption status

### Operator (Admin)
- All participant features
- **Manage participants**: Create users, view balances
- **Manage access codes**: Generate and track codes
- **Notion integration**: Configure and sync with Notion databases
- Manage points and rewards
- Approve/reject/fulfill redemption requests
- Import/export CSV data

## CSV Import/Export

### Import Points (Admin)
Upload CSV file with format:
\`\`\`csv
email,delta,reason
alice@caltech.edu,50,Event attendance
bob@caltech.edu,100,Workshop completion
\`\`\`

### Export Ledger (Admin)
Download complete transaction history as CSV

## Business Rules

1. **Balance integrity**: All point changes go through the ledger
2. **Atomic redemptions**: Balance check, ledger entry, and request creation in one transaction
3. **Automatic refunds**: Rejected requests automatically refund points
4. **Stock management**: Stock decreases on approval (if not unlimited)
5. **Idempotency**: Duplicate redemption requests prevented
6. **Notion sync**: Upserts participants, prevents duplicate ledger entries

## Development

\`\`\`bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production server
npm run start
\`\`\`

## Environment Variables

The bootstrap script automatically generates:
- `JWT_SECRET`: Session encryption key (stored in `.env.local`)

Optional (for Notion integration):
- Notion credentials are stored in SQLite, not environment variables

## Security

- HTTP-only cookies for session management
- JWT tokens with 7-day expiration
- Role-based access control
- SQLite transactions for data integrity
- Access code expiration
- Notion API keys stored encrypted in database

## Customization

### Adding Rewards
1. Log in as admin (`ADMIN2025`)
2. Go to Admin Panel → Manage Rewards
3. Create new reward with title, cost, category, and stock

### Branding
- Primary color: `#FF6C0C` (Caltech Orange)
- Modify `app/globals.css` for theme customization

## Troubleshooting

### Database Issues
Delete `storage/points.db` and restart to recreate with fresh data

### Notion Sync Errors
- Check API key is valid
- Verify databases are shared with integration
- Ensure database properties match expected names
- View sync logs in Admin Panel → Notion Integration

### Port Already in Use
Change port in `package.json`: `"start": "... next start -p 3001"`

### Missing Dependencies
Run `npm install` to ensure all packages are installed

## Backup & Restore

The database is a single file: `storage/points.db`

\`\`\`bash
# Create backup
cp storage/points.db storage/points.backup.db

# Restore from backup
cp storage/points.backup.db storage/points.db
\`\`\`

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite with better-sqlite3
- **Integration**: Notion API (@notionhq/client)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: JWT with HTTP-only cookies
- **TypeScript**: Full type safety

## License

MIT License - Caltech Longevity Club

## Support

For issues or questions, contact the Caltech Longevity Club administrators.
