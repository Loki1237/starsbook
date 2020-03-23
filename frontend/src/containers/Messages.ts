import { connect } from 'react-redux';
import { RootState } from '../reducers/index';
import Messages from '../app/Messages/Messages';

const mapState = (state: RootState) => ({
    messages: state.messages
});

const mapDispatch = (dispatch: any) => ({
    setDialogList: (data: any[]) => {
        dispatch({
            type: "SET_DIALOG_LIST",
            data
        });
    },
    setDialogUser: async (data: any) => {
        dispatch({
            type: "SET_DEALOG_USER",
            data
        });
    },
    setDialogMessages: (data: any[]) => {
        dispatch({
            type: "SET_DIALOG_MESSAGES",
            data
        });
    },
    dialogReset: () => {
        dispatch({
            type: "DIALOG_RESET"
        });
    }
});

export default connect(mapState, mapDispatch)(Messages);
