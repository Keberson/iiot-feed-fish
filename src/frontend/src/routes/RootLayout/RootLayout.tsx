import { Outlet } from "react-router-dom";

import ModalWrapper from "./ModalWrapper/ModalWrapper";
import MessageWrapper from "./MessageWrapper/MessageWrapper";
import SessionWrapper from "./SessionWrapper/SessionWrapper";
import LoadingWrapper from "./LoadingWrapper/LoadingWrapper";
import SidenavWrapper from "./SidenavWrapper/SidenavWrapper";

const RootLayout = () => {
    return (
        <LoadingWrapper>
            <MessageWrapper>
                <SessionWrapper>
                    <ModalWrapper>
                        <SidenavWrapper>
                            <Outlet />
                        </SidenavWrapper>
                    </ModalWrapper>
                </SessionWrapper>
            </MessageWrapper>
        </LoadingWrapper>
    );
};

export default RootLayout;
