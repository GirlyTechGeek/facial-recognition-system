import { Button, Center, FormControl, FormLabel, Input, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function FirstPage() {
  const [loading, isLoading] = useState(false);
  const history = useNavigate();
  let faceio;
  const endpoint = "http://localhost:8888/smart_exam_api/v1/controller"

  const [studentInfo, setStudentInfo] = useState({
    name: '',
    email: '',
    idNumber: '',
    imageUrl: '',
    createdBy: 'Admin'

  });
  const [selectFile, setFile] = useState(null)
  const handleSignIn = async () => {
    faceio = new faceIO("fioa63ba");
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

  const handleFileSelect = (event) => {
    setFile(event.target.files[0])
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setStudentInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }
  const handleLogIn = async (event) => {
    event.preventDefault();
    isLoading(true)
    const formData = new FormData();
    formData.append("file", selectFile);
    const url1 = `${endpoint}/upload_file.php`;
    await axios.post(url1, formData, {
      "Content-Type": "multipart/form-data"
    }).then(async (res) => {
      console.log(res.data.data.fileLocation)
      localStorage.setItem('url', res.data.data.fileLocation)
      const url = `${endpoint}/user.php`;
      const newFile = ({
        name: studentInfo.name,
        email: studentInfo.email,
        idNumber: studentInfo.idNumber,
        imageUrl: res.data.data.fileLocation,
        createdBy: 'Admin'
      })
      //  setStudentInfo(studentInfo, {imageUrl: res.data.data.fileLocation})
      await axios.post(url, newFile).then(async (response) => {
        localStorage.setItem('ID', studentInfo.idNumber)
        if (response.data.statusCode === 201 || 200) {
          isLoading(false)

          Swal.fire({
            text: 'You have successfully logged into the smart examination portal',
            icon: 'success',
            allowOutsideClick: false,
            confirmButtonText: 'OKAY'
          }).then(function () {
            showfacialRecognition()
          })
        } else {
          isLoading(false)
          Swal.fire({
            text: 'Oops1! something went wrong. Please try again',
            icon: 'error',
            allowOutsideClick: false,
            confirmButtonText: 'OKAY'
          })
        }
        console.log(response)
      }, err => {
        isLoading(false)
        console.log(err);
        Swal.fire({
          text: 'Oopsss! something went wrong. Please try again',
          icon: 'error',
          allowOutsideClick: false,
          confirmButtonText: 'OKAY'
        })
      })
    })


  };
  const showfacialRecognition = async () => {
    faceio = new faceIO("fioa63ba");
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
  }
  return (
    <div className="App">
      {/* <h1 class="horizontal"><span>LOGIN</span></h1> */}
      <div className="firstPage" style={{ 'padding': '20px' }} >
        <Center>
          <img src="../assets/gimpa.png" style={{ 'width': '40%', 'marginBottom': '40px' }} />
        </Center>
        <div >
          <p style={{ 'fontSize': 'x-large', 'fontWeight': 'bold' }} >
            LOGIN
          </p>
          {/* <hr /> */}
          <p className='loginDetails' style={{ 'marginBottom': '25px' }}>Please enter your details to access the system</p>

        </div>
        <form onSubmit={handleLogIn}>
          <FormControl isRequired>
            <label>ID Number</label>
            <Input variant='filled' type={'number'} maxLength={'9'} placeholder='ID number' name="idNumber" onChange={handleChange} defaultValue={FormData.idNumber} required />
            <label>Upload ID Card</label>
            <Input variant='filled' type="file" accept="image/*" placeholder='enter' name="imageUrl" onChange={handleFileSelect} required />
          </FormControl>
          <Button className="mt-3" colorScheme='blue' variant="solid" type="submit" width={'100%'} disabled={loading}>{loading ? 'Please Wait...' : 'Log In'}</Button>

        </form>
        <button onClick={handleSignIn}>sign</button>
      </div>

      <img src="../assets/bg.png" style={{ 'width': '100%', "height": '100vh' }} />

    </div>
  );
}

export default FirstPage;
