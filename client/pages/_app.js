import 'bootstrap/dist/css/bootstrap.css'
import buildClient from '../api/buildClient'
import Header from '../components/header';

const AppComponent = ({ Component, pageProps }) => {
    const { currentUser } = pageProps;
    return (
        <div>
        <Header currentUser={currentUser} />
        <Component {...pageProps} />
        </div>
    )
}

AppComponent.getIninitalProps = async (appContext) => {
    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentuser');

    let pageProps = {};
    if(appContext.Component.getIninitalProps){
        pageProps = await appContext.Component.getIninitalProps(appContext.ctx)
    }

    return {
        pageProps,
        ...data
    };
}

export default AppComponent;