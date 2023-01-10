import axios from "axios";

const LandingPage = ({ currentuser }) => {
  return (
    <div>index 1</div>
  )
}

LandingPage.getInitialProps = async () => {
  if(typeof window === 'undefined'){
    const response = await axios.get('https://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser');
    return response.data;
  }
  else{
    const response = await axios.get('/api/users/currentuser');
    return response.data;
  }
  
}

export default LandingPage;