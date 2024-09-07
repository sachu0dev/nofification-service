'use client';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import { Helmet } from 'react-helmet';
import { useEffect } from 'react';

export default function MetadataUpdater() {
  const notifications = useSelector((state) => state.notification.notifications);
  console.log("Notifications: ", notifications);
  
  const notificationCount = notifications.length;
  const title = notificationCount > 0 ? `(${notificationCount}) Grovyo` : 'Grovyo';
  console.log("Title: ", title);

  useEffect(()=>{
    document.title = title;
  }, [notifications])

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content="A dynamic description based on notifications" />
    </Head>
  );
}
