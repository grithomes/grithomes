import './App.css';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import ForgotPassword from './screens/ForgotPassword';
import ResetPassword from './screens/ResetPassword';
import Userdashboard from './screens/userpanel/Userdashboard';
import Team from './screens/userpanel/Team';
import Addteam from './screens/userpanel/Addteam';
import Timeview from './screens/userpanel/Timeview';
import Timeschemahistory from './screens/Timeschemahistory';
import Teammenberdashboard from './screens/Teammemberpanel/Teammenberdashboard';
import Customerlist from './screens/userpanel/Customerlist';
import Addcustomer from './screens/userpanel/Addcustomer';
import Editcustomer from './screens/userpanel/Editcustomer';
import Itemlist from './screens/userpanel/Itemlist';
import Additem from './screens/userpanel/Additem';
import Edititem from './screens/userpanel/Edititem';
import InventoryList from './screens/userpanel/InventoryList';
import Addinventory from './screens/userpanel/Addinventory';
import JobsList from './screens/userpanel/JobList';
import JobDetail from './screens/userpanel/JobDetail';
import TeamMyJobs from './screens/Teammemberpanel/MyJobs';
import TeamJobDetail from './screens/Teammemberpanel/JobDetail';
import Editinventory from './screens/userpanel/Editinventory';
import Editteam from './screens/userpanel/Editteam';
import Createinvoice from './screens/userpanel/Createinvoice';
import Invoicedetail from './screens/userpanel/Invoicedetail';
import Editinvoice from './screens/userpanel/Editinvoice';
import Invoice from './screens/userpanel/Invoice';
import Createestimate from './screens/userpanel/Createestimate';
import Estimatedetail from './screens/userpanel/Estimatedetail';
import Editestimate from './screens/userpanel/Editestimate';
import Estimate from './screens/userpanel/Estimate';
import Teamhistory from './screens/Teammemberpanel/Teamhistory';
import Imageupload from './screens/userpanel/Imageupload';
import Editprofile from './screens/userpanel/Editprofile';
import Overdue from './screens/userpanel/Overdue';
import Reports from './screens/userpanel/Reports';
import Customerwiseinvoice from './screens/userpanel/Customerwiseinvoice'
import Esign from './screens/userpanel/Esign';
import Customersign from './screens/userpanel/Customersign';
import Customersigninvoice from './screens/userpanel/Customersigninvoice';
import Signature from './screens/userpanel/Signature';
import Completedocument from './screens/userpanel/Completedocument';
import Category from './screens/userpanel/Expense/Category';
import UserNotes from './screens/userpanel/Notes';
import TeamNotes from './screens/Teammemberpanel/Notes';
// import { InvoiceProvider } from './components/InvoiceContext';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Vendor from './screens/userpanel/Expense/Vendor';
import ExpenseEntries from './screens/userpanel/Expense/ExpenseEntries';

function App() {
  return (
    // <InvoiceProvider>
      <Router>
        <div>
          <Routes>
            <Route exact path='/' element={<Login/>} />
            <Route exact path='/signup' element={<SignUp/>} />
            <Route exact path='/ForgotPassword' element={<ForgotPassword/>} />
            <Route exact path='/reset-password/:token' element={<ResetPassword/>} />
            <Route exact path='/userpanel/Userdashboard' element={<Userdashboard/>} />
            <Route exact path='/userpanel/Team' element={<Team/>} />
            <Route exact path='/userpanel/Addteam' element={<Addteam/>} />
            <Route exact path='/userpanel/Editteam' element={<Editteam/>} />
            <Route exact path='/userpanel/Timeview' element={<Timeview/>} />
            <Route exact path='/userpanel/Customerlist' element={<Customerlist/>} />
            <Route exact path='/userpanel/Addcustomer' element={<Addcustomer/>} />
            <Route exact path='/userpanel/Editcustomer' element={<Editcustomer/>} />
            <Route exact path='/userpanel/Itemlist' element={<Itemlist/>} />
            <Route exact path='/userpanel/Additem' element={<Additem/>} />
            <Route exact path='/userpanel/Edititem' element={<Edititem/>} />
            <Route exact path='/userpanel/InventoryList' element={<InventoryList/>} />
            <Route exact path='/userpanel/Addinventory' element={<Addinventory/>} />
            <Route exact path='/userpanel/JobsList' element={<JobsList/>} />
            <Route exact path='/userpanel/JobDetail/:jobId' element={<JobDetail/>} />
            <Route exact path='/userpanel/Editinventory' element={<Editinventory/>} />
            <Route exact path='/userpanel/Createinvoice' element={<Createinvoice/>} />
            <Route exact path='/userpanel/Invoicedetail' element={<Invoicedetail/>} />
            <Route exact path='/userpanel/Invoice' element={<Invoice/>} />
            <Route exact path='/userpanel/Editinvoice' element={<Editinvoice/>} />
            <Route exact path='/userpanel/Createestimate' element={<Createestimate/>} />
            <Route exact path='/userpanel/Estimatedetail' element={<Estimatedetail/>} />
            <Route exact path='/userpanel/Editestimate' element={<Editestimate/>} />
            <Route exact path='/userpanel/Estimate' element={<Estimate/>} />
            <Route exact path='/userpanel/Imageupload' element={<Imageupload/>} />
            <Route exact path='/userpanel/Editprofile' element={<Editprofile/>} />
            <Route exact path='/userpanel/Overdue' element={<Overdue/>} />
            <Route exact path='/userpanel/Reports' element={<Reports/>} />
            <Route exact path='/userpanel/Customerwiseinvoice' element={<Customerwiseinvoice/>} />
            <Route exact path='/customersign' element={<Customersign/>} />
            <Route exact path='/customersigninvoice' element={<Customersigninvoice/>} />
            <Route exact path='/completedocument' element={<Completedocument/>} />
            <Route exact path='/userpanel/E-sign' element={<Esign/>} />
            <Route exact path='/userpanel/Signature' element={<Signature/>} />
            <Route exact path='/userpanel/Category' element={<Category/>} />
            <Route exact path='/userpanel/Vendor' element={<Vendor/>} />
            <Route exact path='/userpanel/Expense' element={<ExpenseEntries/>} />
            <Route exact path='/Timeschemahistory' element={<Timeschemahistory/>} />
            <Route exact path='/Teammemberpanel/Teammenberdashboard' element={<Teammenberdashboard/>} />
            <Route exact path='/Teammemberpanel/History' element={<Teamhistory/>} />
            <Route exact path='/Teammemberpanel/MyJobs' element={<TeamMyJobs/>} />
            <Route exact path='/Teammemberpanel/JobDetail/:jobId' element={<TeamJobDetail/>} />
            <Route exact path='/userpanel/Notes' element={<UserNotes/>} />
            <Route exact path='/Teammemberpanel/Notes' element={<TeamNotes/>} />
          </Routes>
        </div>
      </Router>
    // {/* </InvoiceProvider> */}
  );
}

export default App;
