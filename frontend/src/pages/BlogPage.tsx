import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Blogs from '../components/Blogs'
export default function BlogPage() {
    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />
            <Blogs />
            <Footer />
        </div>
    )
}
