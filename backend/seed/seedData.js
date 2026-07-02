/**
 * Seed script — populates the database with demo data so the application
 * is immediately explorable after setup.
 *
 * Usage:
 *   npm run seed            populate demo data
 *   npm run seed:destroy    wipe all collections
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Attendance = require('../models/Attendance');
const { generateTicketCode, generateQRCodeImage } = require('../utils/qrCodeUtil');
const { v4: uuidv4 } = require('uuid');

const destroy = process.argv.includes('--destroy');

const run = async () => {
  await connectDB();

  if (destroy) {
    await Promise.all([
      User.deleteMany(),
      Event.deleteMany(),
      Booking.deleteMany(),
      Ticket.deleteMany(),
      Attendance.deleteMany(),
    ]);
    console.log('All collections cleared.');
    process.exit(0);
  }

  console.log('Seeding database...');

  await Promise.all([
    User.deleteMany(),
    Event.deleteMany(),
    Booking.deleteMany(),
    Ticket.deleteMany(),
    Attendance.deleteMany(),
  ]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  });

  const organizer1 = await User.create({
    name: 'Sara Khan',
    email: 'organizer@example.com',
    password: 'password123',
    role: 'organizer',
    bio: 'Tech meetup organizer based in Karachi.',
  });

  const attendee1 = await User.create({
    name: 'Ali Raza',
    email: 'attendee@example.com',
    password: 'password123',
    role: 'attendee',
    interests: ['Technology', 'Business'],
  });

  const attendee2 = await User.create({
    name: 'Fatima Noor',
    email: 'fatima@example.com',
    password: 'password123',
    role: 'attendee',
    interests: ['Music', 'Art & Culture'],
  });

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const eventsData = [
    {
      title: 'Karachi Tech Summit 2026',
      description: 'A full-day summit covering AI, web development and startups, featuring speakers from leading Pakistani tech companies.',
      category: 'Technology',
      tags: ['Technology', 'AI', 'Startups'],
      organizer: organizer1._id,
      venue: 'Expo Centre Karachi',
      address: 'Shahrah-e-Faisal, Karachi',
      startDate: new Date(now + 10 * day),
      endDate: new Date(now + 10 * day + 8 * 60 * 60 * 1000),
      price: 1500,
      capacity: 200,
      coverImage: '',
      status: 'published',
    },
    {
      title: 'Startup Networking Night',
      description: 'An evening of networking for founders, freelancers and investors. Light refreshments provided.',
      category: 'Networking',
      tags: ['Networking', 'Business', 'Startups'],
      organizer: organizer1._id,
      venue: 'The Hive Coworking',
      address: 'Clifton, Karachi',
      startDate: new Date(now + 5 * day),
      endDate: new Date(now + 5 * day + 3 * 60 * 60 * 1000),
      price: 0,
      capacity: 80,
      status: 'published',
    },
    {
      title: 'Live Acoustic Music Evening',
      description: 'Local artists perform original acoustic sets in an intimate outdoor setting.',
      category: 'Music',
      tags: ['Music', 'Art & Culture'],
      organizer: organizer1._id,
      venue: 'Beach View Park',
      address: 'DHA, Karachi',
      startDate: new Date(now + 20 * day),
      endDate: new Date(now + 20 * day + 4 * 60 * 60 * 1000),
      price: 500,
      capacity: 150,
      status: 'published',
    },
    {
      title: 'Frontend Development Workshop',
      description: 'A hands-on workshop covering React, Tailwind CSS, and modern frontend tooling for beginners and intermediate developers.',
      category: 'Education',
      tags: ['Technology', 'Education', 'Web Development'],
      organizer: organizer1._id,
      venue: 'Online',
      isOnline: true,
      onlineLink: 'https://meet.example.com/frontend-workshop',
      startDate: new Date(now + 3 * day),
      endDate: new Date(now + 3 * day + 3 * 60 * 60 * 1000),
      price: 0,
      capacity: 300,
      status: 'published',
    },
  ];

  const events = await Event.insertMany(eventsData);
  console.log(`Created ${events.length} events.`);

  // Create a sample booking + ticket for attendee1 on the first event so
  // dashboards and "My Tickets" have something to display out of the box
  const targetEvent = events[0];
  const totalAmount = targetEvent.price * 1;

  const booking = await Booking.create({
    user: attendee1._id,
    event: targetEvent._id,
    quantity: 1,
    totalAmount,
    paymentMethod: targetEvent.price > 0 ? 'card' : 'free',
    bookingReference: `BK-${uuidv4().slice(0, 8).toUpperCase()}`,
  });

  targetEvent.seatsBooked += 1;
  await targetEvent.save();

  const ticketCode = generateTicketCode();
  const qrCodeImage = await generateQRCodeImage(ticketCode);

  await Ticket.create({
    booking: booking._id,
    event: targetEvent._id,
    user: attendee1._id,
    ticketCode,
    qrCodeImage,
    seatNumber: 1,
  });

  console.log('Seed data created successfully.');
  console.log('---------------------------------------------');
  console.log('Demo accounts (password: password123):');
  console.log(`  Admin:     ${admin.email}`);
  console.log(`  Organizer: ${organizer1.email}`);
  console.log(`  Attendee:  ${attendee1.email}`);
  console.log(`  Attendee:  ${attendee2.email}`);
  console.log('---------------------------------------------');

  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
