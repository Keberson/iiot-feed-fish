import type { IconProps } from "#assets/interface";

const Moon: React.FC<Exclude<IconProps, "fill">> = ({ size = "32px" }) => {
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
            <circle cx="32" cy="32" r="30" fill="#3e4347"></circle>

            <g fill="#464d51">
                <circle cx="50" cy="35.2" r="7"></circle>

                <circle cx="18.1" cy="39" r="6"></circle>

                <circle cx="24.2" cy="50" r="9"></circle>

                <circle cx="24" cy="17.2" r="4"></circle>

                <circle cx="37" cy="18.2" r="4"></circle>

                <circle cx="12.1" cy="25.9" r="4"></circle>

                <circle cx="39" cy="9.2" r="2"></circle>

                <circle cx="8.1" cy="39" r="2"></circle>

                <circle cx="52" cy="50" r="2"></circle>

                <circle cx="25" cy="29.9" r="3"></circle>

                <circle cx="15" cy="15.7" r="2"></circle>

                <circle cx="46" cy="52.6" r="4"></circle>

                <path d="M24.2 10.8c0 2.8 2.2 5 5 5s5-2.2 5-5s-2.2-5-5-5c-2.8-.1-5 2.2-5 5"></path>
            </g>
        </svg>
    );
};

export default Moon;
