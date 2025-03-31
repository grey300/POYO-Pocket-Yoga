import React from 'react'
import Landing from '../../components/Landing'
import Benifits from '../../components/Benifits'
import Yogapose from '../../components/Yogapose'
import Navbar from '../../components/NavBar'
import Footer from '../../components/Footer'


export default function Home() {
  return (
    <div>
      <Navbar />
      <Landing />
      <div><Benifits /></div>
      <div><Yogapose /></div>
      <Footer />
    </div>
  )
}
