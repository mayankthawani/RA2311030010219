# Notification System Design

## Stage 1: API Design

The notification system requires a set of REST APIs to manage user notifications efficiently.

* **GET /notifications**
  Fetch all notifications for a user. Can include filters like unread or type.

* **GET /notifications/:id**
  Fetch a specific notification by its ID.

* **POST /notifications**
  Create a new notification.

* **PUT /notifications/:id/read**
  Mark a notification as read or unread.

* **DELETE /notifications/:id**
  Delete a notification.

### Example Response Format

```json
{
  "id": "123",
  "studentId": "1042",
  "type": "Placement",
  "message": "Company XYZ is hiring",
  "isRead": false,
  "createdAt": "2026-04-22T17:51:30Z"
}
```

For real-time updates, technologies like WebSockets or Server-Sent Events (SSE) can be used to push notifications instantly.

## Stage 2: Database Design

**Database Choice:** MongoDB (NoSQL)

### Schema Design

```json
{
  "_id": "ObjectId",
  "studentId": "String",
  "type": "String",
  "message": "String",
  "isRead": "Boolean",
  "createdAt": "Date"
}
```

### Reason for Choosing MongoDB

* Flexible schema for different notification types
* Easy horizontal scaling
* Suitable for high-volume data

### Potential Issues at Scale

* Large number of notifications per user
* Slower queries without indexing

### Solutions

* Add index on `studentId`
* Add index on `isRead`
* Use pagination for large datasets
* Archive old notifications

## Stage 3: Query Optimization

### Original Query

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

### Issues

* Full table scan if no indexes
* Sorting large datasets is expensive

### Optimizations

* Add composite index: `(studentID, isRead, createdAt)`
* Avoid `SELECT *`, fetch only required fields

### Optimized Query

```sql
SELECT id, message, type, createdAt
FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

### Additional Query

Fetch placement notifications from last 7 days:

```sql
SELECT *
FROM notifications
WHERE type = 'Placement'
AND createdAt >= NOW() - INTERVAL 7 DAY;
```

## Stage 4: Performance Improvement

Fetching all notifications on every request is inefficient.

### Improvements

* Implement pagination using `limit` and `offset`
* Use caching (e.g., Redis) for frequently accessed data
* Load only recent or unread notifications initially
* Use lazy loading (load more when needed)

### Trade-offs

* Pagination improves performance but adds complexity
* Caching reduces database load but may serve stale data
* Lazy loading improves user experience but requires frontend handling

## Stage 5: System Design Improvement

### Problem

Bulk notifications (emails + app notifications) may fail partially during execution.

### Issues in Current Approach

* Synchronous execution
* No retry mechanism
* Tight coupling between services

### Improved Design

* Use a message queue (RabbitMQ or Kafka)
* Process notifications asynchronously
* Implement retry mechanism for failures
* Separate notification service and email service

### Pseudocode

```text
function notify_all(student_ids, message):
    for student_id in student_ids:
        enqueue_job(student_id, message)

worker_process():
    while queue not empty:
        job = get_job()
        try:
            save_to_db(job)
            send_email(job)
            push_notification(job)
        except:
            retry(job)
```

### Benefits

* Improved reliability
* Better scalability
* Fault tolerance

## Stage 6: Priority Notifications

To display the top 'n' most important notifications:

### Priority Rules

* Placement > Result > Event
* More recent notifications have higher priority

### Approach

* Assign weights:

  * Placement = 3
  * Result = 2
  * Event = 1

* Sort notifications:

  1. By priority
  2. By timestamp (latest first)

### Efficient Handling

* Use sorting or a max-heap
* Maintain top N notifications dynamically

This ensures users always see the most relevant and recent notifications first.
