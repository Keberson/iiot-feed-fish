import type { IconProps } from "#assets/interface";

const Sunset: React.FC<Exclude<IconProps, "fill">> = ({ size = "32px" }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            role="img"
            preserveAspectRatio="xMidYMid meet"
        >
            <path fill="#ef8a45" d="M0 0h64v64H0z"></path>

            <g fill="#f9b04e">
                <path opacity=".5" d="M28.2 0L30 28h4l1.8-28z"></path>

                <path opacity=".5" d="M46.8 0L37 28.6l3.7 1.5L56.5 0z"></path>

                <path opacity=".5" d="M64 8.4L43.3 31.9l2.8 2.8L64 18.9z"></path>

                <path opacity=".5" d="M64 29.4l-16.1 7.9l1.5 3.7L64 36z"></path>

                <path opacity=".5" d="M23.3 30.1l3.7-1.5L17.2 0H7.5z"></path>

                <path opacity=".5" d="M0 18.9l17.9 15.8l2.8-2.8L0 8.4z"></path>

                <path opacity=".5" d="M0 36l14.6 5l1.5-3.7L0 29.4z"></path>

                <path d="M0 48.9l14-.9v-4l-14-.9z"></path>
            </g>

            <circle cx="32" cy="38.7" r="25.3" fill="#ffc466"></circle>

            <path d="M48 45.7h16V64H44V49.7c0-2.2 1.8-4 4-4" fill="#62727a"></path>

            <g fill="#d0d0d0">
                <path d="M60.8 49h.4c.4 0 .8.4.8 1v14h-2V50c0-.6.4-1 .8-1"></path>

                <path d="M55.8 49h.4c.4 0 .8.4.8 1v14h-2V50c0-.6.4-1 .8-1"></path>
            </g>

            <g fill="#62727a">
                <path d="M51.3 43h11v2.9h-11z"></path>

                <path d="M0 43.1h13.1v-5.2L0 40.9z"></path>

                <path d="M0 43h13v21H0z"></path>
            </g>

            <g fill="#ed4c5c">
                <path d="M9.5 51c0 .5-.4 1-1 1h-3c-.6 0-1-.5-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2"></path>

                <path d="M9.5 59c0 .5-.4 1-1 1h-3c-.6 0-1-.5-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2"></path>
            </g>

            <path
                fill="#3e4347"
                d="M50 38v-4l-6-2V21h-2v11l-6 2v4h-3v-7.7L23 19L13 30.3V64h40V38z"
            ></path>

            <g fill="#6adbc6">
                <path d="M41.5 45c0 .5-.5 1-1 1h-3c-.5 0-1-.5-1-1v-2c0-.6.5-1 1-1h3c.5 0 1 .4 1 1v2"></path>

                <path d="M49.5 53c0 .5-.5 1-1 1h-3c-.5 0-1-.5-1-1v-2c0-.6.5-1 1-1h3c.5 0 1 .4 1 1v2"></path>

                <path d="M41.5 61c0 .5-.5 1-1 1h-3c-.5 0-1-.5-1-1v-2c0-.6.5-1 1-1h3c.5 0 1 .4 1 1v2"></path>

                <path d="M49.5 61c0 .5-.5 1-1 1h-3c-.5 0-1-.5-1-1v-2c0-.6.5-1 1-1h3c.5 0 1 .4 1 1v2"></path>
            </g>

            <g fill="#ffdd7d">
                <path d="M30 43c0 .5-.5 1-1 1H17c-.5 0-1-.5-1-1v-2c0-.6.5-1 1-1h12c.5 0 1 .4 1 1v2"></path>

                <path d="M30 59c0 .5-.5 1-1 1H17c-.5 0-1-.5-1-1v-2c0-.6.5-1 1-1h12c.5 0 1 .4 1 1v2"></path>

                <path d="M30 35c0 .5-.5 1-1 1H17c-.5 0-1-.5-1-1v-2c0-.6.5-1 1-1h12c.5 0 1 .4 1 1v2"></path>

                <path d="M30 51c0 .5-.5 1-1 1H17c-.5 0-1-.5-1-1v-2c0-.6.5-1 1-1h12c.5 0 1 .4 1 1v2"></path>
            </g>
        </svg>
    );
};

export default Sunset;
