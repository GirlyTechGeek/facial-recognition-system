import { Button, FormControl, FormLabel, Input, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Navigate } from 'react-router';
import { useNavigate } from 'react-router-dom';

function FirstPage() {
 const history = useNavigate();
  let faceio;

  useEffect(() => {
    faceio = new faceIO("fioa437b");
  }, []);
  const handleSignIn = async () => {
    try {
      let response = await faceio.enroll({
        locale: "auto",
        payload: {
          email: "example@gmail.com",
          pin: "12345",
        },
      });

      console.log(` Unique Facial ID: ${response.facialId}
    Enrollment Date: ${response.timestamp}
    Gender: ${response.details.gender}
    Age Approximation: ${response.details.age}`);
    } catch (error) {
      console.log(error);
    }
  };
  const handleLogIn = async () => {
    
    try {
      let response = await faceio.authenticate({
        locale: "auto",
      });
      console.log(` Unique Facial ID: ${response.facialId}
        PayLoad: ${response.payload}
        `);
        await history('/exam')
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      {/* <h1 class="horizontal"><span>LOGIN</span></h1> */}
    
      <div className="firstPage p-3" >
      <div className="horizontal">
        <p style={{'fontSize':'x-large','fontWeight':'bold'}} >
          LOGIN
        </p>
        <hr />
        <p style={{'fontSize':'small'}}>Please enter your details to access the system</p>

      </div>
        <form>
          <FormControl isRequired>
            <FormLabel>Full name</FormLabel>
            <Input variant='filled' placeholder='Full name' />
            <FormLabel>Email address</FormLabel>
            <Input variant='filled' placeholder='Email address' />
            <FormLabel>ID</FormLabel>
            <Input variant='filled' placeholder='ID number' />
            <FormLabel>ID Card</FormLabel>
            <Input variant='filled' type="file" />
          </FormControl>
          <Button className="mt-3" onClick={handleLogIn} colorScheme='blue' variant="solid" type="submit" width={'100%'}>Continue</Button>

          {/* <Button onClick={handleSignIn} className="mt-3" colorScheme='blue' variant="solid" type="submit" width={'100%'}>Continue</Button> */}
        </form>

      </div>
      {/* <button onClick={handleSignIn}>Sign-in</button> */}
      {/* <button onClick={handleLogIn}>Log-in</button> */}
      {/* <FirstPage/> */}
      <img src="../assets/bg.png" style={{ 'width': '100%', "height": '100vh' }} />

    </div>
  );
}

export default FirstPage;
