# UML & System Diagrams
## EventSphere — Smart Event Management Platform

All diagrams are written in [Mermaid](https://mermaid.js.org/) syntax and render directly on
GitHub. Mermaid has no dedicated "Use Case" or "DFD" diagram type, so those two are represented
using flowchart syntax with actor/process/data-store shapes, following common academic convention.

---

## 1. Use Case Diagram

```mermaid
flowchart LR
    Visitor([Visitor])
    Attendee([Attendee])
    Organizer([Organizer])
    Admin([Admin])

    subgraph System["EventSphere Platform"]
        UC1(Register / Login)
        UC2(Search & Filter Events)
        UC3(Book Event / Get QR Ticket)
        UC4(Cancel Booking)
        UC5(Manage Profile & Interests)
        UC6(View Recommendations)
        UC7(Create / Edit / Delete Event)
        UC8(View Attendee List)
        UC9(Scan & Verify QR Ticket)
        UC10(Manual Check-in)
        UC11(View Organizer Dashboard)
        UC12(View Admin Dashboard)
        UC13(Manage Users)
    end

    Visitor --> UC1
    Visitor --> UC2

    Attendee --> UC2
    Attendee --> UC3
    Attendee --> UC4
    Attendee --> UC5
    Attendee --> UC6

    Organizer --> UC5
    Organizer --> UC7
    Organizer --> UC8
    Organizer --> UC9
    Organizer --> UC10
    Organizer --> UC11

    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
```

---

## 2. Activity Diagram — Book Event & Generate Ticket

```mermaid
flowchart TD
    Start([Start]) --> A[Attendee opens event details page]
    A --> B{Logged in?}
    B -- No --> C[Redirect to Login] --> A
    B -- Yes --> D[Select quantity]
    D --> E[Submit booking request]
    E --> F{Event published & not started?}
    F -- No --> G[Show error: not bookable] --> End1([End])
    F -- Yes --> H{Seats available >= quantity?}
    H -- No --> I[Show error: insufficient seats] --> End1
    H -- Yes --> J[Create Booking record]
    J --> K[Increment event.seatsBooked]
    K --> L[Loop: generate signed ticket code + QR image for each seat]
    L --> M[Persist Ticket documents]
    M --> N[Return booking + tickets to client]
    N --> O[Display QR tickets to attendee]
    O --> End2([End])
```

---

## 3. Activity Diagram — Scan & Verify Ticket at Entry

```mermaid
flowchart TD
    Start([Start]) --> A[Organizer opens Scan QR page]
    A --> B[Camera captures QR code]
    B --> C{Signature valid?}
    C -- No --> D[Reject: invalid/tampered code] --> End1([End])
    C -- Yes --> E{Ticket exists in DB?}
    E -- No --> F[Reject: ticket not found] --> End1
    E -- Yes --> G{Organizer owns this event or is Admin?}
    G -- No --> H[Reject: not authorized] --> End1
    G -- Yes --> I{Ticket status?}
    I -- cancelled --> J[Reject: cancelled ticket] --> End1
    I -- used --> K[Reject: already used] --> End1
    I -- valid --> L[Mark ticket as used]
    L --> M[Create Attendance record]
    M --> N[Display: Entry Granted]
    N --> End2([End])
```

---

## 4. Sequence Diagram — Booking + QR Ticket Generation

```mermaid
sequenceDiagram
    actor Attendee
    participant FE as React Frontend
    participant API as Express API
    participant MW as Auth Middleware
    participant BC as BookingController
    participant DB as MongoDB
    participant QR as QR Util

    Attendee->>FE: Click "Book now"
    FE->>API: POST /api/bookings {eventId, quantity}
    API->>MW: protect() verifies JWT
    MW-->>API: req.user attached
    API->>BC: createBooking(req)
    BC->>DB: findById(event)
    DB-->>BC: event document
    BC->>BC: validate status, date, seat availability
    BC->>DB: Booking.create({...})
    BC->>DB: event.seatsBooked += quantity; save()
    loop for each seat
        BC->>QR: generateTicketCode()
        QR-->>BC: signed code
        BC->>QR: generateQRCodeImage(code)
        QR-->>BC: base64 QR image
        BC->>DB: Ticket.create({...})
    end
    BC-->>API: { booking, tickets }
    API-->>FE: 201 Created
    FE-->>Attendee: Show QR ticket(s)
```

---

## 5. Sequence Diagram — QR Ticket Verification at Entry

```mermaid
sequenceDiagram
    actor Organizer
    participant FE as React Frontend (Scanner)
    participant API as Express API
    participant TC as TicketController
    participant QR as QR Util
    participant DB as MongoDB

    Organizer->>FE: Point camera at attendee's QR code
    FE->>FE: html5-qrcode decodes text
    FE->>API: POST /api/tickets/verify {ticketCode}
    API->>TC: verifyTicket(req)
    TC->>QR: verifyTicketCode(ticketCode)
    QR-->>TC: signature valid? (bool)
    alt invalid signature
        TC-->>API: 400 invalid/tampered
        API-->>FE: Entry Denied
    else valid signature
        TC->>DB: Ticket.findOne({ticketCode})
        DB-->>TC: ticket or null
        alt not found / wrong organizer / already used / cancelled
            TC-->>API: 4xx with reason
            API-->>FE: Entry Denied + reason
        else valid & owned & unused
            TC->>DB: ticket.status = 'used'; save()
            TC->>DB: Attendance.create({...})
            TC-->>API: 200 Entry Granted
            API-->>FE: Entry Granted
        end
    end
    FE-->>Organizer: Show result (granted/denied)
```

---

## 6. Class Diagram (Domain Model)

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String role
        +String[] interests
        +Boolean isActive
        +Date lastLogin
        +matchPassword(plain) Boolean
    }

    class Event {
        +ObjectId _id
        +String title
        +String description
        +String category
        +String[] tags
        +ObjectId organizer
        +String venue
        +Boolean isOnline
        +Date startDate
        +Date endDate
        +Number price
        +Number capacity
        +Number seatsBooked
        +String status
        +Number viewCount
        +seatsAvailable() Number
    }

    class Booking {
        +ObjectId _id
        +ObjectId user
        +ObjectId event
        +Number quantity
        +Number totalAmount
        +String status
        +String paymentMethod
        +String bookingReference
    }

    class Ticket {
        +ObjectId _id
        +ObjectId booking
        +ObjectId event
        +ObjectId user
        +String ticketCode
        +String qrCodeImage
        +Number seatNumber
        +String status
        +Date usedAt
    }

    class Attendance {
        +ObjectId _id
        +ObjectId event
        +ObjectId ticket
        +ObjectId user
        +ObjectId verifiedBy
        +Date checkedInAt
        +String method
    }

    class Analytics {
        +ObjectId _id
        +ObjectId event
        +Date date
        +Number bookingsCount
        +Number ticketsSold
        +Number revenue
        +Number attendanceCount
        +Number views
    }

    User "1" --> "many" Event : organizes
    User "1" --> "many" Booking : makes
    User "1" --> "many" Ticket : owns
    Event "1" --> "many" Booking : receives
    Event "1" --> "many" Ticket : issues
    Booking "1" --> "many" Ticket : generates
    Event "1" --> "many" Attendance : records
    Ticket "1" --> "0..1" Attendance : checked-in-as
    User "1" --> "many" Attendance : verifies (staff)
    Event "1" --> "many" Analytics : snapshots
```

---

## 7. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email
        string password
        string role
        string_array interests
        boolean isActive
    }

    EVENT {
        ObjectId _id PK
        string title
        string description
        string category
        ObjectId organizer FK
        string venue
        date startDate
        date endDate
        number price
        number capacity
        number seatsBooked
        string status
    }

    BOOKING {
        ObjectId _id PK
        ObjectId user FK
        ObjectId event FK
        number quantity
        number totalAmount
        string status
        string bookingReference
    }

    TICKET {
        ObjectId _id PK
        ObjectId booking FK
        ObjectId event FK
        ObjectId user FK
        string ticketCode
        string qrCodeImage
        number seatNumber
        string status
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId event FK
        ObjectId ticket FK
        ObjectId user FK
        ObjectId verifiedBy FK
        date checkedInAt
        string method
    }

    ANALYTICS {
        ObjectId _id PK
        ObjectId event FK
        date date
        number bookingsCount
        number ticketsSold
        number revenue
        number attendanceCount
    }

    USER ||--o{ EVENT : "organizes"
    USER ||--o{ BOOKING : "makes"
    USER ||--o{ TICKET : "owns"
    USER ||--o{ ATTENDANCE : "verifies (staff)"
    EVENT ||--o{ BOOKING : "receives"
    EVENT ||--o{ TICKET : "issues"
    EVENT ||--o{ ATTENDANCE : "logs"
    EVENT ||--o{ ANALYTICS : "snapshots"
    BOOKING ||--o{ TICKET : "generates"
    TICKET ||--o| ATTENDANCE : "results in"
```

---

## 8. Data Flow Diagram (Level 1)

```mermaid
flowchart LR
    Attendee[/Attendee/]
    Organizer[/Organizer/]
    Admin[/Admin/]

    P1((1.0\nAuth & Profile))
    P2((2.0\nEvent Management))
    P3((3.0\nBooking & Ticketing))
    P4((4.0\nEntry Verification))
    P5((5.0\nAnalytics & Recommendations))

    DS1[(Users DB)]
    DS2[(Events DB)]
    DS3[(Bookings / Tickets DB)]
    DS4[(Attendance DB)]
    DS5[(Analytics DB)]

    Attendee -- credentials/profile --> P1
    Organizer -- credentials/profile --> P1
    Admin -- credentials/profile --> P1
    P1 <--> DS1

    Organizer -- event details --> P2
    Admin -- moderation actions --> P2
    P2 <--> DS2

    Attendee -- booking request --> P3
    P3 --> DS2
    P3 <--> DS3
    P3 -- QR ticket --> Attendee

    Organizer -- scanned QR --> P4
    Admin -- scanned QR --> P4
    P4 <--> DS3
    P4 --> DS4
    P4 -- grant/deny result --> Organizer

    P5 <--> DS3
    P5 <--> DS4
    P5 <--> DS5
    P5 <--> DS2
    P5 -- dashboard data --> Organizer
    P5 -- dashboard data --> Admin
    P5 -- recommended events --> Attendee
```

---

## 9. Component / Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["Browser (React SPA)"]
        Pages[Pages]
        Components[Reusable Components]
        Context[AuthContext]
        AxiosClient[Axios API Client]
    end

    subgraph Server["Express API"]
        Routes[Routes]
        Middleware[Middleware: auth, role, validate, rate-limit]
        Controllers[Controllers]
        Utils[Utils: JWT, QR, Recommendation Engine, Analytics Engine]
        Models[Mongoose Models]
    end

    DB[(MongoDB)]

    Pages --> Components
    Pages --> Context
    Context --> AxiosClient
    AxiosClient -- HTTPS / JSON --> Routes
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Utils
    Controllers --> Models
    Models --> DB
```
