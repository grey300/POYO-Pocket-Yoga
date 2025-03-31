const Footer = () => {
    return (
        <>
            <div className="bg-[#242F2A] pb-10 pt-16">
                <div className="container mx-auto flex flex-wrap justify-around">
                    <div className="flex flex-col items-left text-white text-[12px] mb-8 md:mb-0 md:w-1/4">
                        <p className="text-[32px] py-3">Quick Links</p>
                        <a href="/about" className="py-1">AI Planner</a>
                        <a href="/yogaclass" className="py-1">Yoga Class</a>
                        <a href="/yoga" className="py-1">Live Session</a>
                    </div>
                    <div className="flex flex-col items-left text-white text-[12px] mb-8 md:mb-0 md:w-1/4">
                        <p className="text-[26px] py-3">Contact Us</p>
                        <p className="py-1">Thimphu</p>
                        <p className="py-1">773424433</p>
                        <p className="py-1">poyo@gmail.com</p>
                    </div>

                    <div className="flex flex-col items-right text-white text-[12px] md:w-1/3">
                        <p className="text-[26px] mt-3">Don’t miss the latest update!</p>
                        <p>Sign up and get notified about new items and promotions.</p>
                        <div className="flex items-left mt-5">
                            <input type="text" placeholder="Enter your email" className="py-1 rounded-md" />
                            <button type="submit" className="ml-2 py-1 bg-[#3A5A40] text-white rounded-md px-3">Send</button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center mt-16 lg:ml-8 lg:mr-8 px-4">
                    <div className="flex text-white items-center flex-col md:flex-row md:justify-between space-y-8 md:space-y-0">
                        <p>© 2024 All rights reserved Pocket Yoga (PoYo)</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;
