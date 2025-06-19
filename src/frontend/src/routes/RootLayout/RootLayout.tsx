import { Outlet } from "react-router-dom";

import ModalWrapper from "./ModalWrapper/ModalWrapper";
import MessageWrapper from "./MessageWrapper/MessageWrapper";
import LoadingWrapper from "./LoadingWrapper/LoadingWrapper";
import SidenavWrapper from "./SidenavWrapper/SidenavWrapper";
import RedirectWrapper from "./RedirectWrapper/RedirectWrapper";

const RootLayout = () => {
    return (
        <LoadingWrapper>
            <MessageWrapper>
                <ModalWrapper>
                    <SidenavWrapper>
                        <RedirectWrapper>
                            <Outlet />
                        </RedirectWrapper>
                    </SidenavWrapper>
                </ModalWrapper>
            </MessageWrapper>
        </LoadingWrapper>
    );
};

export default RootLayout;
