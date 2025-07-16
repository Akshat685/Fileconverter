import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Contacts from '../components/Contacts'


export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />
            <Contacts />
            <Footer />
        </div>
    )
}
