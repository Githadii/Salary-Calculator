import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState} from "react"; 
import { Card } from 'react-bootstrap';
import { Button, Form, Modal, Col, Row } from "react-bootstrap";
import reset from "./images/reset.png";

function App() {

  // State to manage modal visibility
  const [showModal, setShowModal] = useState(false);
  const [basicSalary, setBasicSalary] = useState('');
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [modalType, setModalType] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isEpfEft, setIsEpfEft] = useState(false);

  const handleResetClick = () => {
    setShowModal(true);
    setModalType('reset');
  };

   // Function to handle confirming the reset
  const handleConfirmReset = () => {
    setBasicSalary('');
    setAllowances([]);
    setDeductions([]);
    setShowModal(false);
  };


  // Function to handle add allowance click
  const handleAddClick = (type) => {
    setShowModal(true);
    setModalType(type);
  };

  const handleConfirmAdd = () => {
    if (modalType === 'allowance') {
      setAllowances([...allowances,{ description: newDescription, amount: parseFloat(newAmount), isEpfEft }]);
    } else if (modalType === 'deduction') {
      setDeductions([...deductions, { description: newDescription, amount: parseFloat(newAmount) }]);
    }
    handleClose();
  };

  const handleDelete = (type, index) => {
    if (type === 'allowance') {
      setAllowances(allowances.filter((_, i) => i !== index));
    } else if (type === 'deduction') {
      setDeductions(deductions.filter((_, i) => i !== index));
    }
  };

  const handleEdit = (type, index) => {
    if (type === 'allowance') {
      const allowance = allowances[index];
      setNewDescription(allowance.description);
      setNewAmount(allowance.amount);
      setIsEpfEft(allowance.isEpfEft);
      setShowModal(true);
      setModalType('editAllowance');
    } else if (type === 'deduction') {
      const deduction = deductions[index];
      setNewDescription(deduction.description);
      setNewAmount(deduction.amount);
      setShowModal(true);
      setModalType('editDeduction');
    }
  };

  // Function to handle closing the modal
  const handleClose = () => {
    setShowModal(false);
  };

  // Apply tax rates based on IRD guidelines
const calculateApit = (taxableIncome) => {
  let apit = 0;

  if (taxableIncome <= 100000) {
      apit = 0;  // Relief from tax
  } else if (taxableIncome<= 141667) {
      apit = (taxableIncome * 0.06) - 6000;
  } else if (taxableIncome <= 183333) {
      apit = (taxableIncome * 0.12) - 14500;
  } else if (taxableIncome<= 225000) {
      apit = (taxableIncome * 0.18) - 25500;
  } else if (taxableIncome <= 266667) {
      apit = (taxableIncome * 0.24) - 39000;
  } else if (taxableIncome <= 308333) {
      apit = (taxableIncome * 0.3) - 55000;
  } else {
      apit = (taxableIncome * 0.36) - 73500;
  }
  
  return apit;
};

const handleCalculate = () => {
  const taxableIncome = (parseFloat(basicSalary) + allowances.reduce((acc, cur) => acc + cur.amount, 0)).toFixed(2) - 
  deductions.reduce((acc, cur) => acc + cur.amount, 0).toFixed(2);
  const monthlyApit = calculateApit(taxableIncome);
  //setApit(monthlyApit);
  return monthlyApit.toFixed(2);
};

  const calculateNetSalary = () => {
    const totalAllowances = allowances.reduce((acc, cur) => acc + cur.amount, 0);
    const totalDeductions = deductions.reduce((acc, cur) => acc + cur.amount, 0).toFixed(2);
    const grossEarning = (parseFloat(basicSalary) + totalAllowances).toFixed(2) - totalDeductions;
    const employeeEpf = ((parseFloat(basicSalary) + allowances.filter(a => a.isEpfEft).reduce((acc, cur) => 
      acc + cur.amount, 0)- (deductions.reduce((acc, cur) => acc + cur.amount, 0)))   * 0.08)
      .toFixed(2);
    const taxableIncome = grossEarning;
    const monthlyApit = calculateApit(taxableIncome);
    const netSalary = (grossEarning - employeeEpf - monthlyApit.toFixed(2));
    return netSalary.toFixed(2);
  };

  const calculateEpfEftContribution = () => {
    const epfBase = parseFloat(basicSalary) + allowances.filter(a => a.isEpfEft).reduce((acc, cur) => acc + cur.amount, 0) - deductions.reduce((acc, cur) => acc + cur.amount, 0);
    const employerEpf = epfBase * 0.12;
    const employerEtf = epfBase * 0.03;
    const totalDeductions = deductions.reduce((acc, cur) => acc +  parseFloat(cur.amount), 0);
    const totalAllowances = allowances.reduce((acc, cur) => acc + cur.amount, 0);
    const grossEarning = parseFloat(basicSalary) + totalAllowances;
    return { employerEpf: employerEpf.toFixed(2), employerEtf: employerEtf.toFixed(2), ctc: (grossEarning - totalDeductions + employerEpf + employerEtf).toFixed(2) };
  };

 
  return (
    <div>
       <main style={{marginLeft:"20px",marginTop:"20px"}}> 
        <Row>
          <Col md={6}>
        <Card 
        style={{
          width :"680px",
          height:"616px",
          border:"1px solid #000000",
          backgroundColor: "#f8f9fa" ,
          position: "relative"  }}>
          <Card.Body style={{marginLeft:"10px"}}>
          
            <h4 style={{fontWeight:700}}>Calculate Your Salary</h4>
            <button style={{ 
              position: "absolute", 
              top: "10px", 
              right: "10px", 
              display: "flex", 
              alignItems: "center",
              border: "none", 
              background: "none",
              cursor: "pointer"}}
              onClick={handleResetClick}>
                    <img src={reset} alt="reset-icon" style={{ height: "28px", marginRight: "10px" }} />
                    <span style={{color:"blue"}}>Reset</span>
                  </button>
            <Form>
      <Form.Group className="mb-3" controlId="formGroupEmail">
        <Form.Label>Basic Salary</Form.Label><br></br>
        <Form.Control type="text"
         value={basicSalary} 
         onChange={(e) => setBasicSalary(e.target.value)} 
        />
        </Form.Group>
   
    <Form.Label>Earnings</Form.Label>
    <p style={{color:"GrayText",fontSize:"13px"}}>Allowance, Fixed Allowance, Bonus and etc.</p>
    {allowances.map((allowance, index) => (
    <div key={index}>
    <p>{allowance.description}: {allowance.amount ? allowance.amount.toFixed(2) : '0.00'}{allowance.isEpfEft ? ' ✓ EPF/ETF' : ''}</p>
    <Button variant="outline-secondary" onClick={() => handleEdit('allowance', index)}>✎</Button>
    <Button style={{marginLeft:"5px"}} variant="outline-danger" onClick={() => handleDelete('allowance', index)}>✗</Button>
    </div>
    ))}
   
    <Button style={{
      border:"none",
      background:"none",
      cursor:"pointer",
      color:"blue"
    }}
    onClick={() => handleAddClick('allowance')}
    >
      + Add New Allowance
    </Button>

    <hr style={{marginRight:"10px"}}></hr>

    <Form.Label>Deductions</Form.Label>
    <p style={{color:"GrayText",fontSize:"13px"}}>Salary Advances, Loan Deductions and all</p>
    {deductions.map((deduction, index) => (
    <div key={index}>
    <p>{deduction.description}: {deduction.amount ? deduction.amount.toFixed(2) : '0.00'}</p>
    <Button variant="outline-secondary" onClick={() => handleEdit('deduction', index)}>✎</Button>
    <Button style={{marginLeft:"5px"}} variant="outline-danger" onClick={() => handleDelete('deduction', index)}>✗</Button>
    </div>
    ))}
    <Button style={{
      border:"none",
      background:"none",
      cursor:"pointer",
      color:"blue"
    }}
    onClick={() => handleAddClick('deduction')} 
    >
      + Add New Deduction
    </Button>
    </Form>
          </Card.Body>
        </Card>
        </Col>


        <Col md={6}>
        <Card 
        style={{
          marginBottom:"20px",
          marginLeft:"90px",
          width :"480px",
          height:"614px",
          border:"1px solid #000000",
          backgroundColor: "#f8f9fa"
           }}>
        <Card.Body style={{ marginLeft:"10px" }}>
            <h4 style={{fontWeight:700}}>Your Salary</h4>
            <Row className="mt-3">
                <Col><strong>Items</strong></Col>
                <Col><strong>Amount</strong></Col>
              </Row>
              <hr />
              <Row>
                <Col>Basic Salary</Col>
                <Col>{parseFloat(basicSalary).toFixed(2)}</Col>
              </Row>
              <Row>
                <Col>Gross Earning</Col>
                <Col>{(parseFloat(basicSalary) + allowances.reduce((acc, cur) => acc + cur.amount, 0)).toFixed(2)}</Col>
              </Row>
              <Row>
                <Col>Gross Deduction</Col>
                <Col>- {deductions.reduce((acc, cur) => acc + cur.amount, 0).toFixed(2)}</Col>
              </Row>
              <Row>
                <Col>Employee EPF (8%)</Col>
                <Col>- {((parseFloat(basicSalary) + allowances.filter(a => a.isEpfEft).reduce((acc, cur) => 
                acc + cur.amount, 0)- (deductions.reduce((acc, cur) => acc + cur.amount, 0)))   * 0.08)
                .toFixed(2)}</Col>
              </Row>
              <Row>
                <Col>APIT</Col>
                <Col>- {handleCalculate()}</Col>
              </Row>
              <hr />
              <Row className="mt-3">
                <Col><strong>Net Salary (Take Home)</strong></Col>
                <Col>{calculateNetSalary()}</Col>
              </Row>
              <hr />
              <Row className="mt-3">
                <Col><strong>Contribution from the Employer</strong></Col>
              </Row>
              <Row>
                <Col>Employer EPF (12%)</Col>
                <Col>{calculateEpfEftContribution().employerEpf}</Col>
              </Row>
              <Row>
                <Col>Employer ETF (3%)</Col>
                <Col>{calculateEpfEftContribution().employerEtf}</Col>
              </Row>
              <hr />
              <Row className="mt-3">
                <Col><strong>CTC (Cost to Company)</strong></Col>
                <Col>{calculateEpfEftContribution().ctc}</Col>
              </Row>
          </Card.Body>
        </Card>
        </Col>
        </Row>

        {/* Modal for Add Allowance */}
        <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === 'reset' 
          ? 'Reset' 
          : modalType === 'allowance' 
          ? 'Add New Earnings' 
          :modalType === 'deduction' 
          ? 'Add New Deductions' 
          : modalType === 'editAllowance' 
          ? 'Edit Earnings' 
          : modalType === 'editDeductions'
          ? 'Edit Deduction':'Edit Deduction'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'reset' ? (
            <p>Are you sure you want to reset all values?</p>
          ) : (
            <>
              {(modalType === 'allowance' || modalType === 'editAllowance') && (
            <Form.Group className="mb-3" controlId="formEpfEft">
              <Form.Label>Earnings Name</Form.Label>
              <Form.Control type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
              <Form.Label>Amount</Form.Label>
              <Form.Control type="text" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            <Form.Check
              type="checkbox"
              label="EPF/ETF"
              checked={isEpfEft}
              onChange={(e) => setIsEpfEft(e.target.checked)}
            />
          </Form.Group>
        )}

            {(modalType === 'deduction' || modalType === 'editDeduction') && (
            <Form.Group className="mb-3" controlId="formEpfEft">
              <Form.Label>Deductions Name</Form.Label>
              <Form.Control type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
              <Form.Label>Amount</Form.Label>
              <Form.Control type="text" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
          </Form.Group>
        )}
              
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          {modalType === 'reset' ? (
            <Button variant="primary" onClick={handleConfirmReset}>
              Reset
            </Button>
          ) : (
            <Button variant="primary" onClick={handleConfirmAdd}>
              {modalType.includes('edit') ? 'Save Changes' : 'Add'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
       </main>
    </div>
      );
  
}

export default App;
