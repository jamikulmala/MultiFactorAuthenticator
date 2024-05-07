import { AppBar, Box } from "@mui/material"
import { MainToolbar, SubContainer, Subheader } from "../tools/styles";
import { useAppState } from "../tools/context";

export const ToolBar = () => {

    const { state } = useAppState();
    const { reqStatus } = state;

    return(
        <AppBar position="fixed">
            <Box>
                <MainToolbar>
                    <SubContainer>
                        <Subheader>
                            {reqStatus}
                        </Subheader>
                    </SubContainer>
                </MainToolbar>
            </Box>
        </AppBar>
    )
}