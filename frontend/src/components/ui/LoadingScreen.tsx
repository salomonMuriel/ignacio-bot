import { useState, useEffect } from 'react';

// The main loading screen component
export default function LoadingScreen() {
    // State to keep track of the current message index
    const [messageIndex, setMessageIndex] = useState(0);
    // State to handle the fade animation for the text
    const [fading, setFading] = useState(false);
    const [shuffledMessages, setShuffledMessages] = useState<string[]>([]);

    // Array of inspirational loading messages
    const messages = [
        "Seizing the opportunity...",
        "Aiming for the stars...",
        "Igniting innovation...",
        "Forging our path...",
        "Stoking the fires of creation...",
        "Landing on the moon...",
        "Kindling brilliance...",
        "Con puro perrenque!",
        "Building something amazing...",
        "Fueling the engines of progress...",
        "Crafting the future...",
        "Assembling the dream...",
        "Unlocking potential...",
        "Charting new territories...",
        "Generating momentum...",
        "Haciendo que suceda...",
        "Designing tomorrow...",
        "Weaving new connections...",
        "Launching the next big thing...",
        "Dándole con toda!"
    ];

    // useEffect hook to shuffle the messages array once when the component mounts
    useEffect(() => {
        // Using the Fisher-Yates shuffle algorithm for an unbiased shuffle
        const shuffleArray = (array: string[]) => {
            const newArray = [...array]; // Create a copy to avoid mutating the original array
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        };

        setShuffledMessages(shuffleArray(messages));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs only once on mount

    // useEffect hook to handle the interval for changing messages
    useEffect(() => {
        // We don't want to start the interval until the messages have been shuffled
        if (shuffledMessages.length === 0) {
            return;
        }

        const intervalId = setInterval(() => {
            // Trigger the fade-out effect
            setFading(true);

            // After the fade-out duration, update the text and fade back in
            setTimeout(() => {
                setMessageIndex(prevIndex => (prevIndex + 1) % shuffledMessages.length);
                setFading(false);
            }, 500); // Matches the CSS transition duration

        }, 2000); // Changes the message every 4 seconds

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [shuffledMessages]); // This effect now depends on the shuffledMessages state
    return (
        <>
            {/* The CSS that cannot be easily converted to Tailwind classes remains here.
              This includes the custom animations (@keyframes) and the complex
              transformations needed to arrange the emojis in a perfect circle.
            */}
            <style>
                {`
                    .fire-wheel {
                        animation: spin 4s linear infinite;
                    }

                    .fire-spoke {
                        transform-origin: center center;
                    }

                    .fire-spoke > div {
                        animation: unspin 4s linear infinite;
                    }

                    .fire-spoke:nth-child(1) { transform: rotate(0deg) translateY(-60px) rotate(0deg); }
                    .fire-spoke:nth-child(2) { transform: rotate(45deg) translateY(-60px) rotate(-45deg); }
                    .fire-spoke:nth-child(3) { transform: rotate(90deg) translateY(-60px) rotate(-90deg); }
                    .fire-spoke:nth-child(4) { transform: rotate(135deg) translateY(-60px) rotate(-135deg); }
                    .fire-spoke:nth-child(5) { transform: rotate(180deg) translateY(-60px) rotate(-180deg); }
                    .fire-spoke:nth-child(6) { transform: rotate(225deg) translateY(-60px) rotate(-225deg); }
                    .fire-spoke:nth-child(7) { transform: rotate(270deg) translateY(-60px) rotate(-270deg); }
                    .fire-spoke:nth-child(8) { transform: rotate(315deg) translateY(-60px) rotate(-315deg); }

                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    @keyframes unspin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(-360deg); }
                    }
                `}
            </style>

            {/* Main container to center the content */}
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#15192d] text-white">

                {/* The fire wheel animation container */}
                <div className="fire-wheel relative w-[120px] h-[120px] mb-8">
                    <div className="fire-spoke absolute top-1/2 left-1/2 w-[40px] h-[40px] mt-[-20px] ml-[-20px]"><div className="w-full h-full flex items-center justify-center text-[2rem]">🔥</div></div>
                    <div className="fire-spoke absolute top-1/2 left-1/2 w-[40px] h-[40px] mt-[-20px] ml-[-20px]"><div className="w-full h-full flex items-center justify-center text-[2rem]">🔥</div></div>
                    <div className="fire-spoke absolute top-1/2 left-1/2 w-[40px] h-[40px] mt-[-20px] ml-[-20px]"><div className="w-full h-full flex items-center justify-center text-[2rem]">🔥</div></div>
                    <div className="fire-spoke absolute top-1/2 left-1/2 w-[40px] h-[40px] mt-[-20px] ml-[-20px]"><div className="w-full h-full flex items-center justify-center text-[2rem]">🔥</div></div>
                    <div className="fire-spoke absolute top-1/2 left-1/2 w-[40px] h-[40px] mt-[-20px] ml-[-20px]"><div className="w-full h-full flex items-center justify-center text-[2rem]">🔥</div></div>
                    <div className="fire-spoke absolute top-1/2 left-1/2 w-[40px] h-[40px] mt-[-20px] ml-[-20px]"><div className="w-full h-full flex items-center justify-center text-[2rem]">🔥</div></div>
                    <div className="fire-spoke absolute top-1/2 left-1/2 w-[40px] h-[40px] mt-[-20px] ml-[-20px]"><div className="w-full h-full flex items-center justify-center text-[2rem]">🔥</div></div>
                    <div className="fire-spoke absolute top-1/2 left-1/2 w-[40px] h-[40px] mt-[-20px] ml-[-20px]"><div className="w-full h-full flex items-center justify-center text-[2rem]">🔥</div></div>
                </div>

                {/* The loading text that changes dynamically */}
                <div className="text-center">
                    <p
                        className="text-xl font-medium text-gray-300 transition-opacity duration-500 ease-in-out"
                        style={{ opacity: fading ? 0 : 1 }}
                    >
                        {messages[messageIndex]}
                    </p>
                </div>
            </div>
        </>
    );
};
