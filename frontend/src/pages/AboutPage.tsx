import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import About from '../components/About'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />
            <About />
            <Footer />
        </div>
    )
}
