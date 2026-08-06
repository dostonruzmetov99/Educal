const fs = require('fs');

// 1. Add relations to User model
let schema = fs.readFileSync('D:/EduSphere/server/prisma/schema.prisma', 'utf8');
if (!schema.includes('SentMessages')) {
  schema = schema.replace(
    'followedBy   Follow[]      @relation("Following")\n  followingRel Follow[]      @relation("Follower")\n}',
    'followedBy   Follow[]      @relation("Following")\n  followingRel Follow[]      @relation("Follower")\n  sentMessages Message[] @relation("SentMessages")\n  receivedMessages Message[] @relation("ReceivedMessages")\n}'
  );
  
  schema += `
model Message {
  id         Int      @id @default(autoincrement())
  text       String
  senderId   Int
  receiverId Int
  sender     User     @relation("SentMessages", fields: [senderId], references: [id])
  receiver   User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
  createdAt  DateTime @default(now())
}
`;
  fs.writeFileSync('D:/EduSphere/server/prisma/schema.prisma', schema);
}
