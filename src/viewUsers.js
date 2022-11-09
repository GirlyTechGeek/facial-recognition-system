import { Button, FormControl, FormLabel, Grid, GridItem, Input, Spacer, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { Navigate } from 'react-router';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useDownloadExcel } from 'react-export-table-to-excel';

function ViewUsers() {
    const [grades, setGrades] = useState([]);
    let grade;
    const endpoint = "http://localhost:8888/smart_exam_api/v1/controller"
    const tableRef = useRef(null)
  
    useEffect(() => {
    //    const  getUsers = async () => {
            const url = `${endpoint}/grade.php`;
             axios.get(url).then((response) => {
                setGrades(response.data.data);
                // const results =  response.data.data;
                // setGrades(results);
                console.log(response.data.data)
            }, err => {
                console.log(err)
            })
        // }
        
    }, [setGrades])
    const { onDownload } = useDownloadExcel({
        currentTableRef: tableRef.current,
        filename: 'Users table',
        sheet: 'Users'
    })
if(!grades) return null;

    return (
        <div className="App">
            <img src="../assets/gm.png" style={{ 'width': '100%', }} />


            <Grid templateColumns='repeat(5, 1fr)' gap={4}>
                <GridItem colStart={4} colEnd={8} h='10' style={{ 'margin': '3%' }} >

                    <Button onClick={onDownload} colorScheme='blue' variant="solid" width={'100%'} >Export</Button>

                </GridItem>
            </Grid>
            <TableContainer>
                <Table variant='simple' ref={tableRef}>
                    {/* <TableCaption>Imperial to metric conversion factors</TableCaption> */}
                    <Thead>
                        <Tr>
                            <Th>ID Number</Th>
                            <Th>Grade</Th>
                            <Th>Time Taken</Th>
                        </Tr>
                    </Thead>
                        <Tbody>
                     {/* {grades.map((grade) => { */}
                            <Tr>
                                <Td>{grades.idNumber}</Td>
                                <Td>{grades.grade}</Td>
                                <Td>{grades.createdDate}</Td>
                            </Tr>
                    {/* })} */}
                        </Tbody>



                </Table>
            </TableContainer>
        </div>
    );
}

export default ViewUsers;