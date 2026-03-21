'use client'
import React from 'react'
import Script from 'next/script';

const AdSense = ({pId}:{pId: string}) => {
  return (

<Script
  async
  src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`}
  crossOrigin="anonymous"
/>



  )
}

export default AdSense