import React from 'react'

export default function Landing() {
    return (
        <main
            initial="initial"
            animate="enter"
            className={'relative flex h-screen overflow-hidden w-full'}
        >
            <img
                src={'/images/hero.svg'}
                alt="hero_banner"
                width={2000}
                height={800}
                className="absolute w-full h-full object-cover"
                style={{
                    left: '0',
                    right: '0',
                    margin: 'auto',
                }}
            />


            <div className="w-full h-full absolute z-0" />
            <div
                className="flex flex-col gap-8 absolute px-8 xl:px-6 md:py-16 xl:py-6 top-[20%] left-[15%]"
            >
                <div>
                    <p
                        className="text-5xl inline font-semibold"
                    >
                        Mindful Moves,<br />
                        Intelligent Grooves:<br />

                    </p>
                    <p className="text-3xl inline font-semibold">Yoga Re-imagined by AI</p>
                </div>
            </div>

            <div className="absolute bottom-0 w-full flex justify-center items-center lg:justify-center lg:items-center">
                <img src='/images/title.svg'
                    width={800}
                    height={200}
                    className='' />
            </div>
        </main>
    );
}
;