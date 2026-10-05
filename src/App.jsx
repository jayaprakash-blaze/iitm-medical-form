import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import "./App.css";

const API_URL = "http://127.0.0.1:8010";
const IITM_LOGO = "/iitm-logo.png";

const IITMLogo = ({ size = 52, className = "" }) => (
  <img
    src={IITM_LOGO}
    alt="IIT Madras Logo"
    className={`iitm-logo ${className}`}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      objectFit: "contain",
      display: "block",
      flexShrink: 0,
    }}
  />
);

function App() {
  const [profileReturnPage, setProfileReturnPage] = useState("dashboard");
  const [showNavigation, setShowNavigation] = useState(false);
  const [profileData, setProfileData] = useState({
    username: localStorage.getItem("username") || "User",
    email: "",
    role: localStorage.getItem("user_role") || "STUDENT",
  });
  const [profilePhoto, setProfilePhoto] = useState("");

  const openProfile = (returnPage) => {
    setProfileReturnPage(returnPage);
    setShowNavigation(true);
    setPage("profile");
  };

  const [page, setPage] = useState(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    if (!token) {
      return "login";
    }

    if (role === "MEDICAL_OFFICER") {
      return "officer-dashboard";
    }

    if (role === "CHIEF_MEDICAL_OFFICER") {
      return "chief-dashboard";
    }

    if (role === "ADMIN") {
      return "admin-dashboard";
    }

    return "dashboard";
  });

  useEffect(() => {
    if (page !== "profile") {
      return;
    }

    const token = localStorage.getItem("access_token");
    const storedUsername = localStorage.getItem("username") || "User";
    const storedRole = localStorage.getItem("user_role") || "STUDENT";

    setProfilePhoto(
      localStorage.getItem(`profile_photo_${storedUsername}`) || ""
    );

    if (!token) {
      return;
    }

    const loadProfileData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Unable to load profile:", data.detail);
          return;
        }

        const username = data.username || storedUsername;
        const role = data.role || storedRole;

        setProfileData({
          username,
          email: data.email || "",
          role,
        });

        localStorage.setItem("username", username);
        localStorage.setItem("user_role", role);

        setProfilePhoto(
          localStorage.getItem(`profile_photo_${username}`) || ""
        );
      } catch (error) {
        console.error("Unable to load profile:", error);
      }
    };

    loadProfileData();
  }, [page]);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [loginRole, setLoginRole] = useState(
    localStorage.getItem("user_role") || "student"
  );

  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [claims, setClaims] = useState([]);
  const [studentMedicalOfficers, setStudentMedicalOfficers] = useState([]);
  const [forwardSelections, setForwardSelections] = useState({});
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [editingClaimId, setEditingClaimId] = useState(null);
  const [officerClaims, setOfficerClaims] = useState([]);
  const [officerSelectedClaim, setOfficerSelectedClaim] = useState(null);
  const [officerRemarks, setOfficerRemarks] = useState("");

  const [chiefOfficers, setChiefOfficers] = useState([]);
  const [chiefClaims, setChiefClaims] = useState([]);
  const [chiefSelectedClaim, setChiefSelectedClaim] = useState(null);
  const [chiefSelectedOfficer, setChiefSelectedOfficer] = useState(null);
  const [chiefRemarks, setChiefRemarks] = useState("");
  const [chiefClaimFilter, setChiefClaimFilter] = useState("ALL");

  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminClaims, setAdminClaims] = useState([]);
  const [adminSelectedClaim, setAdminSelectedClaim] = useState(null);
  const [adminSelectedUser, setAdminSelectedUser] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [adminRoleChanges, setAdminRoleChanges] = useState({});

  const [formData, setFormData] = useState({
    claimantName: "",
    idNo: "",
    designation: "",
    department: "",
    mobileNo: "",

    patientName: "",
    patientAge: "",
    relationship: "",
    referringMO: "",
    referralDate: "",
    referralHospital: "",

    totalAmount: "",
    totalEnclosures: "",

    declaration: false,
    declarationDate: "",
    signature: "",
  });

  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaExpected, setCaptchaExpected] = useState("");

  const [documentFiles, setDocumentFiles] = useState({
    original_bill: [],
    receipt: [],
    reports: [],
    iitm_hospital_referral: [],
  });

  const [consultations, setConsultations] = useState([
    {
      consultant: "",
      specialty: "",
      date: "",
      amount: "",
    },
  ]);

  const [radiology, setRadiology] = useState([
    {
      type: "Ultrasonography (U/S)",
      region: "",
      date: "",
      amount: "",
    },
  ]);

  const [scopy, setScopy] = useState([
    {
      type: "Endoscopy",
      region: "",
      date: "",
      amount: "",
    },
  ]);

  const [minorProcedures, setMinorProcedures] = useState([
    {
      type: "Suturing",
      region: "",
      date: "",
      amount: "",
    },
  ]);

  const [appliances, setAppliances] = useState([
    {
      type: "Hearing Aid",
      region: "",
      date: "",
      amount: "",
    },
  ]);

  const openDocumentInNewTab = async (docId) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Session expired. Please login again.");
      setPage("login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/documents/${docId}/view`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        alert("Unable to view document or unauthorized access.");
        return;
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("Error opening document:", error);
      alert("Failed to open document.");
    }
  };

  const generateCaptcha = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let captcha = "";

    for (let i = 0; i < 6; i++) {
      captcha += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    setCaptchaQuestion(captcha);
    setCaptchaExpected(captcha);
    setCaptchaAnswer("");
  };

  const updateFormData = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const getRoleDashboardPage = () => {
    const role = localStorage.getItem("user_role");
    if (role === "MEDICAL_OFFICER") return "officer-dashboard";
    if (role === "CHIEF_MEDICAL_OFFICER") return "chief-dashboard";
    if (role === "ADMIN") return "admin-dashboard";
    return "dashboard";
  };

  const syncCurrentUserRole = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const role = data.role || "STUDENT";
      const previousRole = localStorage.getItem("user_role");

      localStorage.setItem("user_role", role);
      localStorage.setItem("username", data.username || "");

      if (previousRole === role) {
        return;
      }

      setLoginRole(
        role === "MEDICAL_OFFICER"
          ? "medical_officer"
          : role === "CHIEF_MEDICAL_OFFICER"
            ? "chief_medical_officer"
            : role === "ADMIN"
              ? "admin"
              : "student"
      );

      if (role === "MEDICAL_OFFICER") {
        await handleViewOfficerClaims();
        return;
      }

      if (role === "CHIEF_MEDICAL_OFFICER") {
        await handleViewChiefDashboard();
        return;
      }

      if (role === "ADMIN") {
        await handleViewAdminDashboard();
        return;
      }

      try {
        const claimsResponse = await fetch(
          `${API_URL}/api/my-claims`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (claimsResponse.ok) {
          const claimsData = await claimsResponse.json();
          setClaims(claimsData.claims || []);
        }
      } catch (error) {
        console.error("Unable to load claims after role change:", error);
      }

      setPage("dashboard");
    } catch (error) {
      console.error("Unable to sync current role:", error);
    }
  };

  useEffect(() => {
    generateCaptcha();

    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    if (token && role === "MEDICAL_OFFICER") {
      handleViewOfficerClaims();
    }

    if (token && role === "CHIEF_MEDICAL_OFFICER") {
      handleViewChiefDashboard();
    }

    if (token && role === "ADMIN") {
      handleViewAdminDashboard();
    }

    if (token) {
      syncCurrentUserRole();

      const roleSyncTimer = setInterval(() => {
        syncCurrentUserRole();
      }, 5000);

      return () => clearInterval(roleSyncTimer);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json().catch(() => ({ detail: "Invalid server response" }));

      if (!response.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("username", loginData.username);

      const role = data.role || "STUDENT";
      localStorage.setItem("user_role", role);

      setLoginRole(
        role === "MEDICAL_OFFICER"
          ? "medical_officer"
          : role === "CHIEF_MEDICAL_OFFICER"
            ? "chief_medical_officer"
            : "student"
      );

      alert("Login successful");

      if (role === "MEDICAL_OFFICER") {
        await handleViewOfficerClaims();
        return;
      }

      if (role === "CHIEF_MEDICAL_OFFICER") {
        await handleViewChiefDashboard();
        return;
      }

      if (role === "ADMIN") {
        await handleViewAdminDashboard();
        return;
      }

      setPage("dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      alert("Cannot connect to backend server. Make sure FastAPI/Backend is running on http://127.0.0.1:8000");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/api/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signupData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Signup failed");
        return;
      }

      alert("Signup successful. Please login.");

      setSignupData({
        username: "",
        email: "",
        password: "",
      });

      setPage("login");
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("username");
    setLoginRole("student");
    setShowNavigation(false);
    setPage("login");
  };

  const loadAvailableMedicalOfficers = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return false;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/medical-officers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          alert("Session expired. Please login again.");
          setPage("login");
          return false;
        }

        alert(data.detail || "Unable to load Medical Officers");
        return false;
      }

      setStudentMedicalOfficers(data.medical_officers || []);
      return true;
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
      return false;
    }
  };

  const handleViewClaims = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    try {
      const [claimsResponse, officersResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/my-claims`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/api/medical-officers`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const data = await claimsResponse.json();
      const officersData = await officersResponse.json();

      if (!claimsResponse.ok) {
        if (claimsResponse.status === 401) {
          localStorage.removeItem("access_token");
          alert("Session expired. Please login again.");
          setPage("login");
          return;
        }

        alert(data.detail || "Unable to load claims");
        return;
      }

      if (!officersResponse.ok) {
        alert(
          officersData.detail ||
          "Unable to load Medical Officers"
        );
        return;
      }

      setClaims(data.claims || []);
      setStudentMedicalOfficers(
        officersData.medical_officers || []
      );
      setForwardSelections({});
      setPage("my-claims");
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };

  const handleViewOfficerClaims = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/officer/claims`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          alert("Session expired. Please login again.");
          setPage("login");
          return;
        }

        alert(data.detail || "Unable to load officer claims");
        return;
      }

      setOfficerClaims(data.claims || []);
      setOfficerSelectedClaim(null);
      setOfficerRemarks("");
      setPage("officer-dashboard");
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };

  const handleViewOfficerClaim = async (claimId) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/officer/claim/${claimId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          alert("Session expired. Please login again.");
          setPage("login");
          return;
        }

        alert(data.detail || "Unable to load claim");
        return;
      }

      setOfficerSelectedClaim(data.claim);
      setOfficerRemarks(data.claim.officer_remarks || "");
      setPage("officer-review");
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };

  const handleOfficerReview = async (claimId, action) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    if ((action === "reject" || action === "send-direct-cmo") && !officerRemarks.trim()) {
      alert("Please enter remarks for this action.");
      return;
    }

    const messages = {
      approve: `Approve Medical Claim #${claimId}?`,
      "send-direct-cmo": `Forward Medical Claim #${claimId} directly to the Chief Medical Officer?`,
      reject: `Reject Medical Claim #${claimId}?`,
    };

    if (!window.confirm(messages[action] || `Continue with ${action}?`)) {
      return;
    }

    try {
      const endpoint =
        action === "send-direct-cmo"
          ? `${API_URL}/api/officer/claim/${claimId}/send-direct-cmo`
          : `${API_URL}/api/officer/claim/${claimId}/${action}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          remarks: officerRemarks.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          alert("Session expired. Please login again.");
          setPage("login");
          return;
        }
        alert(data.detail || "Unable to update claim");
        return;
      }

      alert(data.message || "Claim workflow updated successfully");
      await handleViewOfficerClaims();
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };

  const handleAdminChangeRole = async (userId) => {
    const token = localStorage.getItem("access_token");
    const newRole = adminRoleChanges[userId];

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    if (!newRole) {
      alert("Please select a role first.");
      return;
    }

    const roleName =
      newRole === "STUDENT"
        ? "User"
        : newRole === "MEDICAL_OFFICER"
          ? "Medical Officer"
          : "Chief Medical Officer";

    if (!window.confirm(`Change this user's role to ${roleName}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Unable to change user role");
        return;
      }

      alert(data.message || "User role updated successfully");

      setAdminRoleChanges((previous) => {
        const updated = { ...previous };
        delete updated[userId];
        return updated;
      });

      try {
        const usersResponse = await fetch(
          `${API_URL}/api/admin/users`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const usersData = await usersResponse.json();

        if (usersResponse.ok) {
          setAdminUsers(usersData.users || []);
        } else {
          console.error(
            "Unable to refresh users after role update:",
            usersData.detail
          );
        }
      } catch (refreshError) {
        console.error(
          "Role updated, but users list refresh failed:",
          refreshError
        );
      }
    } catch (error) {
      console.error("Admin role change error:", error);
      alert(
        "Cannot connect to backend. Make sure FastAPI is running on http://127.0.0.1:8000."
      );
    }
  };

  const handleAdminDeactivateUser = async (userId) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    if (!window.confirm("Change this user's role back to User?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/deactivate`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Unable to change user role");
        return;
      }

      alert(data.message || "User changed back to User role");
      await handleViewAdminDashboard();
    } catch (error) {
      console.error("Admin deactivate error:", error);
      alert("Cannot connect to backend");
    }
  };

  const handleAdminViewClaim = (claim) => {
    setAdminSelectedClaim(claim);
    setAdminRemarks(claim.officer_remarks || "");
    setPage("admin-claim");
  };

  const handleAdminReview = async (claimId, action) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    if (action === "reject" && !adminRemarks.trim()) {
      alert("Please enter remarks before rejecting the claim.");
      return;
    }

    const confirmed = window.confirm(
      action === "approve"
        ? `Emergency action: approve Medical Claim #${claimId} and complete sign authority?`
        : `Reject Medical Claim #${claimId}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/admin/claims/${claimId}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            remarks: adminRemarks.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          alert("Session expired. Please login again.");
          setPage("login");
          return;
        }
        alert(data.detail || "Unable to update claim");
        return;
      }

      alert(data.message || "Emergency claim workflow completed");
      setAdminRemarks(data.officer_remarks || adminRemarks.trim());
      await handleViewAdminDashboard();
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };

  const handleViewAdminDashboard = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    try {
      const [statsResponse, usersResponse, claimsResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/admin/dashboard`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/api/admin/users`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/api/admin/claims`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const statsData = await statsResponse.json();
      const usersData = await usersResponse.json();
      const claimsData = await claimsResponse.json();

      if (
        statsResponse.status === 401 ||
        usersResponse.status === 401 ||
        claimsResponse.status === 401
      ) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        alert("Session expired. Please login again.");
        setPage("login");
        return;
      }

      if (
        statsResponse.status === 403 ||
        usersResponse.status === 403 ||
        claimsResponse.status === 403
      ) {
        alert(
          statsData.detail ||
          usersData.detail ||
          claimsData.detail ||
          "Admin access required"
        );
        return;
      }

      if (!statsResponse.ok) {
        alert(statsData.detail || "Unable to load admin dashboard");
        return;
      }

      if (!usersResponse.ok) {
        alert(usersData.detail || "Unable to load users");
        return;
      }

      if (!claimsResponse.ok) {
        alert(claimsData.detail || "Unable to load medical claims");
        return;
      }

      setAdminStats(statsData.statistics || {});
      setAdminUsers(usersData.users || []);
      setAdminClaims(claimsData.claims || []);
      setAdminSelectedClaim(null);
      setAdminRemarks("");
      setPage("admin-dashboard");
    } catch (error) {
      console.error("Admin dashboard error:", error);
      alert("Cannot connect to backend");
    }
  };

  const handleViewChiefDashboard = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    try {
      const [officersResponse, claimsResponse] =
        await Promise.all([
          fetch(
            `${API_URL}/api/chief/officers`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${API_URL}/api/chief/claims`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      const officersData = await officersResponse.json();
      const claimsData = await claimsResponse.json();

      if (
        !officersResponse.ok ||
        !claimsResponse.ok
      ) {
        const detail =
          officersData.detail ||
          claimsData.detail ||
          "Unable to load Chief Medical Officer dashboard";

        if (
          officersResponse.status === 401 ||
          officersResponse.status === 403 ||
          claimsResponse.status === 401 ||
          claimsResponse.status === 403
        ) {
          alert(detail);
          setPage("login");
          return;
        }

        alert(detail);
        return;
      }

      setChiefOfficers(
        officersData.medical_officers || []
      );

      setChiefClaims(
        claimsData.claims || []
      );

      setChiefSelectedClaim(null);
      setChiefRemarks("");
      setPage("chief-dashboard");
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };

  const handleChiefReview = async (
    claimId,
    action
  ) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    if (action === "reject" && !chiefRemarks.trim()) {
      alert("Please enter remarks before rejecting the claim.");
      return;
    }

    const isApproveAuthorize = action === "approve-authorize";
    const confirmed = window.confirm(
      isApproveAuthorize
        ? `Approve Medical Claim #${claimId}?`
        : `Reject Medical Claim #${claimId}?`
    );

    if (!confirmed) return;

    try {
      const endpoint = isApproveAuthorize
        ? `${API_URL}/api/chief/claim/${claimId}/approve-authorize`
        : `${API_URL}/api/officer/claim/${claimId}/reject`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          remarks: chiefRemarks.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Unable to update claim");
        return;
      }

      alert(data.message || "Claim workflow updated successfully");
      await handleViewChiefDashboard();
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };

  const handleViewFullClaim = (claim) => {
    setSelectedClaim(claim);
    setPage("full-claim");
  };

  const normalizeDate = (value) => {
    if (!value) return "";
    return String(value).slice(0, 10);
  };

  const handleEditClaim = (claim) => {
    setSelectedClaim(claim);
    setEditingClaimId(claim.id);

    setFormData({
      claimantName: claim.claimant_name || "",
      idNo: claim.id_no || "",
      designation: claim.designation || "",
      department: claim.department || "",
      mobileNo: claim.mobile_no || "",
      patientName: claim.patient_name || "",
      patientAge: claim.patient_age ?? "",
      relationship: claim.relationship || "",
      referringMO: claim.medical_officer || "",
      referralDate: normalizeDate(claim.referral_date),
      referralHospital: claim.referral_hospital || "",
      totalAmount: claim.total_amount ?? "",
      totalEnclosures: claim.total_enclosures ?? "",
      declaration: Boolean(claim.declaration),
      declarationDate: normalizeDate(claim.declaration_date),
      signature: claim.signature || "",
    });

    const expenses = claim.expenses || [];

    const consultationItems = expenses
      .filter((item) => item.category === "Consultation")
      .map((item) => ({
        consultant: item.consultant || "",
        specialty: item.specialty || "",
        date: normalizeDate(item.expense_date),
        amount: item.amount ?? "",
      }));

    const radiologyItems = expenses
      .filter((item) => item.category === "Radiology")
      .map((item) => ({
        type: item.item_type || "Ultrasonography (U/S)",
        region: item.region || "",
        date: normalizeDate(item.expense_date),
        amount: item.amount ?? "",
      }));

    const scopyItems = expenses
      .filter((item) => item.category === "Scopy / Procedure")
      .map((item) => ({
        type: item.item_type || "Endoscopy",
        region: item.region || "",
        date: normalizeDate(item.expense_date),
        amount: item.amount ?? "",
      }));

    const minorItems = expenses
      .filter((item) => item.category === "Minor Procedure")
      .map((item) => ({
        type: item.item_type || "Suturing",
        region: item.region || "",
        date: normalizeDate(item.expense_date),
        amount: item.amount ?? "",
      }));

    const applianceItems = expenses
      .filter((item) => item.category === "Appliance")
      .map((item) => ({
        type: item.item_type || "Hearing Aid",
        region: item.region || "",
        date: normalizeDate(item.expense_date),
        amount: item.amount ?? "",
      }));

    setConsultations(consultationItems.length ? consultationItems : [{
      consultant: "", specialty: "", date: "", amount: ""
    }]);

    setRadiology(radiologyItems.length ? radiologyItems : [{
      type: "Ultrasonography (U/S)", region: "", date: "", amount: ""
    }]);

    setScopy(scopyItems.length ? scopyItems : [{
      type: "Endoscopy", region: "", date: "", amount: ""
    }]);

    setMinorProcedures(minorItems.length ? minorItems : [{
      type: "Suturing", region: "", date: "", amount: ""
    }]);

    setAppliances(applianceItems.length ? applianceItems : [{
      type: "Hearing Aid", region: "", date: "", amount: ""
    }]);

    setPage("edit-form");
  };

  const buildClaimPayload = () => ({
    claimantName: formData.claimantName,
    idNo: formData.idNo,
    designation: formData.designation,
    department: formData.department,
    mobileNo: formData.mobileNo,
    patientName: formData.patientName,
    patientAge: Number(formData.patientAge),
    relationship: formData.relationship,
    referringMO: formData.referringMO,
    referralDate: formData.referralDate || null,
    referralHospital: formData.referralHospital || null,
    consultations: consultations.map((item) => ({
      consultant: item.consultant,
      specialty: item.specialty,
      date: item.date,
      amount: Number(item.amount || 0),
    })),
    radiology: radiology.map((item) => ({
      type: item.type,
      region: item.region,
      date: item.date,
      amount: Number(item.amount || 0),
    })),
    scopy: scopy.map((item) => ({
      type: item.type,
      region: item.region,
      date: item.date,
      amount: Number(item.amount || 0),
    })),
    minorProcedures: minorProcedures.map((item) => ({
      type: item.type,
      region: item.region,
      date: item.date,
      amount: Number(item.amount || 0),
    })),
    appliances: appliances.map((item) => ({
      type: item.type,
      region: item.region,
      date: item.date,
      amount: Number(item.amount || 0),
    })),
    totalAmount: Number(formData.totalAmount || 0),
    totalEnclosures: Number(formData.totalEnclosures || 0),
    declaration: formData.declaration,
    declarationDate: formData.declarationDate,
    signature: formData.signature,
  });

  const handleUpdateClaim = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/medical-claim/${editingClaimId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(buildClaimPayload()),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          alert("Session expired. Please login again.");
          setPage("login");
          return;
        }
        alert(data.detail || "Medical claim update failed");
        return;
      }

      await uploadClaimDocuments(data.claim_id || editingClaimId);

      alert(`Medical claim updated successfully!\nClaim ID: ${data.claim_id || editingClaimId}`);
      setDocumentFiles({
        original_bill: [],
        receipt: [],
        reports: [],
        iitm_hospital_referral: [],
      });
      setEditingClaimId(null);
      setSelectedClaim(null);
      await handleViewClaims();
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };

  const handleForwardClaim = async (claimId) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    const medicalOfficer =
      forwardSelections[claimId] || "";

    if (!medicalOfficer) {
      alert("Please select a Medical Officer first.");
      return;
    }

    const confirmed = window.confirm(
      `Forward Medical Claim #${claimId} to ${medicalOfficer}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/medical-claim/${claimId}/forward`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            medical_officer: medicalOfficer,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          alert("Session expired. Please login again.");
          setPage("login");
          return;
        }

        alert(
          data.detail ||
          "Unable to forward medical claim"
        );
        return;
      }

      alert(
        data.message ||
        "Medical claim forwarded successfully"
      );

      await handleViewClaims();
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };

  const handleDeleteClaim = async (claimId) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Medical Claim #${claimId}?`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/medical-claim/${claimId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          alert("Session expired. Please login again.");
          setPage("login");
          return;
        }
        alert(data.detail || "Unable to delete claim");
        return;
      }

      alert("Medical claim deleted successfully");
      await handleViewClaims();
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };

  const handleDocumentChange = (documentType, event) => {
    const files = Array.from(event.target.files || []);
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    const invalid = files.find(
      (file) => !allowedTypes.includes(file.type) || file.size > maxSize
    );

    if (invalid) {
      alert(
        "Only PDF, DOCX, DOC, JPG, PNG or WEBP files up to 10 MB each are allowed."
      );
      event.target.value = "";
      return;
    }

    setDocumentFiles((previous) => ({
      ...previous,
      [documentType]: files,
    }));
  };

  const uploadClaimDocuments = async (claimId) => {
    const token = localStorage.getItem("access_token");
    if (!token || !claimId) return true;

    const documentEntries = Object.entries(documentFiles).flatMap(
      ([documentType, files]) =>
        files.map((file) => ({ documentType, file }))
    );

    if (documentEntries.length === 0) {
      return true;
    }

    try {
      for (const { documentType, file } of documentEntries) {
        const body = new FormData();
        body.append("document_type", documentType);
        body.append("file", file);

        const response = await fetch(
          `${API_URL}/api/medical-claim/${claimId}/documents`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body,
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          alert(
            data.detail ||
              `Unable to upload ${file.name}. The medical claim was created successfully.`
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Document upload error:", error);
      alert(
        "Medical claim was created, but one or more documents could not be uploaded."
      );
      return false;
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login again");
      setPage("login");
      return;
    }

    if (!captchaAnswer.trim()) {
      alert("Please enter the CAPTCHA answer.");
      return;
    }

    if (captchaAnswer.trim() !== captchaExpected) {
      alert("Incorrect CAPTCHA. Please try again.");
      generateCaptcha();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/medical-claim`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            claimantName: formData.claimantName,
            idNo: formData.idNo,
            designation: formData.designation,
            department: formData.department,
            mobileNo: formData.mobileNo,
            patientName: formData.patientName,
            patientAge: Number(formData.patientAge),
            relationship: formData.relationship,
            referringMO: formData.referringMO,
            referralDate: formData.referralDate || null,
            referralHospital: formData.referralHospital || null,
            consultations: consultations.map((item) => ({
              consultant: item.consultant,
              specialty: item.specialty,
              date: item.date,
              amount: Number(item.amount || 0),
            })),
            radiology: radiology.map((item) => ({
              type: item.type,
              region: item.region,
              date: item.date,
              amount: Number(item.amount || 0),
            })),
            scopy: scopy.map((item) => ({
              type: item.type,
              region: item.region,
              date: item.date,
              amount: Number(item.amount || 0),
            })),
            minorProcedures: minorProcedures.map((item) => ({
              type: item.type,
              region: item.region,
              date: item.date,
              amount: Number(item.amount || 0),
            })),
            appliances: appliances.map((item) => ({
              type: item.type,
              region: item.region,
              date: item.date,
              amount: Number(item.amount || 0),
            })),
            totalAmount: Number(formData.totalAmount),
            totalEnclosures: Number(formData.totalEnclosures),
            declaration: formData.declaration,
            declarationDate: formData.declarationDate,
            signature: "CAPTCHA VERIFIED",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          alert("Session expired. Please login again.");
          setPage("login");
          return;
        }

        alert(data.detail || "Medical claim submission failed");
        return;
      }

      await uploadClaimDocuments(data.claim_id);

      alert(`Medical claim submitted successfully!\nClaim ID: ${data.claim_id}`);

      setDocumentFiles({
        original_bill: [],
        receipt: [],
        reports: [],
        iitm_hospital_referral: [],
      });

      generateCaptcha();
      setCaptchaAnswer("");
      setPage(getRoleDashboardPage());
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend");
    }
  };

  const addConsultation = () => {
    setConsultations([
      ...consultations,
      {
        consultant: "",
        specialty: "",
        date: "",
        amount: "",
      },
    ]);
  };

  const updateConsultation = (index, field, value) => {
    const updated = [...consultations];
    updated[index][field] = value;
    setConsultations(updated);
  };

  const removeConsultation = (index) => {
    setConsultations(consultations.filter((_, i) => i !== index));
  };

  const addRadiology = () => {
    setRadiology([
      ...radiology,
      {
        type: "Ultrasonography (U/S)",
        region: "",
        date: "",
        amount: "",
      },
    ]);
  };

  const updateRadiology = (index, field, value) => {
    const updated = [...radiology];
    updated[index][field] = value;
    setRadiology(updated);
  };

  const removeRadiology = (index) => {
    setRadiology(radiology.filter((_, i) => i !== index));
  };

  const addScopy = () => {
    setScopy([
      ...scopy,
      {
        type: "Endoscopy",
        region: "",
        date: "",
        amount: "",
      },
    ]);
  };

  const updateScopy = (index, field, value) => {
    const updated = [...scopy];
    updated[index][field] = value;
    setScopy(updated);
  };

  const removeScopy = (index) => {
    setScopy(scopy.filter((_, i) => i !== index));
  };

  const addMinorProcedure = () => {
    setMinorProcedures([
      ...minorProcedures,
      {
        type: "Suturing",
        region: "",
        date: "",
        amount: "",
      },
    ]);
  };

  const updateMinorProcedure = (index, field, value) => {
    const updated = [...minorProcedures];
    updated[index][field] = value;
    setMinorProcedures(updated);
  };

  const removeMinorProcedure = (index) => {
    setMinorProcedures(minorProcedures.filter((_, i) => i !== index));
  };

  const addAppliance = () => {
    setAppliances([
      ...appliances,
      {
        type: "Hearing Aid",
        region: "",
        date: "",
        amount: "",
      },
    ]);
  };

  const updateAppliance = (index, field, value) => {
    const updated = [...appliances];
    updated[index][field] = value;
    setAppliances(updated);
  };

  const removeAppliance = (index) => {
    setAppliances(appliances.filter((_, i) => i !== index));
  };

  const downloadClaimAsPDF = async (claim, viewerRole = "User") => {
    let pdfLogo = null;

    try {
      pdfLogo = new Image();
      pdfLogo.src = IITM_LOGO;
      await new Promise((resolve, reject) => {
        pdfLogo.onload = resolve;
        pdfLogo.onerror = reject;
      });
    } catch (error) {
      console.warn("Public IITM logo could not be loaded for PDF:", error);
      pdfLogo = null;
    }
    if (!claim) {
      alert("No medical claim selected.");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 12;
      let y = 12;

      const textValue = (val) => (val === null || val === undefined ? "" : String(val));
      const money = (val) => {
        if (val === null || val === undefined || val === "") return "";
        const num = Number(val);
        return Number.isFinite(num) ? num.toFixed(2) : String(val);
      };

      const drawHeader = (pageNum) => {
        y = 12;

        try {
          if (pdfLogo) doc.addImage(pdfLogo, "PNG", margin, y, 18, 18);
        } catch (e) {
          console.warn("Logo failed to render:", e);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(0, 0, 0);
        doc.text(`(${pageNum})`, pageWidth / 2, y, { align: "center" });
        y += 4;

        doc.setFontSize(9);
        doc.text('FORM "C"', pageWidth / 2, y, { align: "center" });
        y += 4;

        doc.setFontSize(9.5);
        doc.text("MEDICAL CLAIM FORM – 1", pageWidth / 2, y, { align: "center" });
        y += 4;

        doc.setFontSize(9);
        doc.text("INSTITUTE HOSPITAL", pageWidth / 2, y, { align: "center" });
        y += 4;

        doc.setFontSize(9.5);
        doc.text("INDIAN INSTITUTE OF TECHNOLOGY MADRAS, CHENNAI – 600036", pageWidth / 2, y, { align: "center" });
        y += 3;

        doc.setLineWidth(0.4);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;

        if (pageNum === 1) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text(
            "Application for claiming refund of medical expenses incurred in connection with medical treatment of",
            margin,
            y
          );
          y += 3.8;
          doc.text("IIT Madras employee and their dependants.", margin, y);
          y += 6;
        }
      };

      const drawGridTable = (headers, rows, columnWidths, startY) => {
        let currentY = startY;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        let maxHeaderLines = 1;
        headers.forEach((h, i) => {
          const lines = doc.splitTextToSize(h, columnWidths[i] - 2);
          if (lines.length > maxHeaderLines) maxHeaderLines = lines.length;
        });

        const headerRowHeight = Math.max(7, maxHeaderLines * 3.5 + 3);
        let currentX = margin;

        headers.forEach((h, i) => {
          const w = columnWidths[i];
          doc.setDrawColor(0, 0, 0);
          doc.rect(currentX, currentY, w, headerRowHeight);
          const lines = doc.splitTextToSize(h, w - 2);
          const textY = currentY + (headerRowHeight / 2) - ((lines.length - 1) * 1.8) + 1;
          doc.text(lines, currentX + w / 2, textY, { align: "center" });
          currentX += w;
        });

        currentY += headerRowHeight;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        rows.forEach((row) => {
          currentX = margin;
          let maxLines = 1;

          row.forEach((cellText, i) => {
            const w = columnWidths[i];
            const lines = doc.splitTextToSize(textValue(cellText), w - 2);
            if (lines.length > maxLines) maxLines = lines.length;
          });

          const rowH = Math.max(6.5, maxLines * 3.5 + 2.5);

          row.forEach((cellText, i) => {
            const w = columnWidths[i];
            doc.rect(currentX, currentY, w, rowH);
            const lines = doc.splitTextToSize(textValue(cellText), w - 2);
            
            if (i === row.length - 1 && textValue(cellText).trim() !== "") {
              doc.text(lines, currentX + w - 2, currentY + 4, { align: "right" });
            } else if (i === 0 || i === 2) {
              doc.text(lines, currentX + w / 2, currentY + 4, { align: "center" });
            } else {
              doc.text(lines, currentX + 1.5, currentY + 4);
            }
            currentX += w;
          });

          currentY += rowH;
        });

        return currentY;
      };

      drawHeader(1);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("I. Information of the claimant.", margin, y);
      y += 3.5;

      const sec1Headers = ["Claimant Name", "ID No.", "Designation", "Department", "Mobile No."];
      const sec1Widths = [45, 30, 35, 40, 36];
      const sec1Data = [[
        claim.claimant_name || "",
        claim.id_no || "",
        claim.designation || "",
        claim.department || "",
        claim.mobile_no || ""
      ]];

      y = drawGridTable(sec1Headers, sec1Data, sec1Widths, y) + 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("II. Information of the Patient.", margin, y);
      y += 3.5;

      const sec2Headers = [
        "Name",
        "Age",
        "Relationship to\nthe claimant",
        "Name of the\nreferring M.O with Date",
        "Referral\nHospital/Clinic/Diagnostic\ncentre"
      ];
      const sec2Widths = [42, 18, 35, 45, 46];
      const sec2Data = [[
        claim.patient_name || "",
        claim.patient_age ?? "",
        claim.relationship || "",
        `${claim.medical_officer || ""} ${normalizeDate(claim.referral_date)}`.trim(),
        claim.referral_hospital || ""
      ]];

      y = drawGridTable(sec2Headers, sec2Data, sec2Widths, y) + 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("III. Details of Medical Expenses.", margin, y);
      y += 3.5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(
        "N.B: Attach Original Bill, Receipts, Reports, and IIT Hospital Referral slip.",
        margin + 15,
        y
      );
      y += 4;

      const colWidths = [15, 50, 52, 36, 33];
      const startX = margin;
      const hHeight = 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);

      doc.rect(startX, y, colWidths[0], hHeight * 3);
      doc.text("Sl. No", startX + colWidths[0] / 2, y + (hHeight * 3) / 2, { align: "center" });

      doc.rect(startX + colWidths[0], y, colWidths[1] + colWidths[2], hHeight);
      doc.text(
        "Particulars",
        startX + colWidths[0] + (colWidths[1] + colWidths[2]) / 2,
        y + 4.2,
        { align: "center" }
      );

      doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2], y, colWidths[3], hHeight * 3);
      doc.text(
        "Date",
        startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] / 2,
        y + (hHeight * 3) / 2,
        { align: "center" }
      );

      doc.rect(
        startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
        y,
        colWidths[4],
        hHeight * 3
      );
      doc.text(
        "Amount. Rs.",
        startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] / 2,
        y + (hHeight * 3) / 2,
        { align: "center" }
      );

      y += hHeight;

      doc.rect(startX + colWidths[0], y, colWidths[1] + colWidths[2], hHeight);
      doc.text(
        "Consultation",
        startX + colWidths[0] + (colWidths[1] + colWidths[2]) / 2,
        y + 4.2,
        { align: "center" }
      );

      y += hHeight;

      doc.rect(startX + colWidths[0], y, colWidths[1], hHeight);
      doc.text("Name of the Consultant", startX + colWidths[0] + colWidths[1] / 2, y + 4.2, { align: "center" });

      doc.rect(startX + colWidths[0] + colWidths[1], y, colWidths[2], hHeight);
      doc.text("Speciality", startX + colWidths[0] + colWidths[1] + colWidths[2] / 2, y + 4.2, { align: "center" });

      y += hHeight;

      const expenses = claim.expenses || [];
      const consultItems = expenses.filter((e) => e.category === "Consultation");
      const consultRows = consultItems.length > 0
        ? consultItems.map((c, i) => [
            String(i + 1),
            c.consultant || "",
            c.specialty || "",
            normalizeDate(c.expense_date),
            money(c.amount)
          ])
        : [["1", "", "", "", ""]];

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      consultRows.forEach((row) => {
        let currentX = startX;

        doc.rect(currentX, y, colWidths[0], hHeight);
        doc.text(textValue(row[0]), currentX + colWidths[0] / 2, y + 4, { align: "center" });
        currentX += colWidths[0];

        doc.rect(currentX, y, colWidths[1], hHeight);
        doc.text(textValue(row[1]), currentX + 2, y + 4);
        currentX += colWidths[1];

        doc.rect(currentX, y, colWidths[2], hHeight);
        doc.text(textValue(row[2]), currentX + 2, y + 4);
        currentX += colWidths[2];

        doc.rect(currentX, y, colWidths[3], hHeight);
        doc.text(textValue(row[3]), currentX + colWidths[3] / 2, y + 4, { align: "center" });
        currentX += colWidths[3];

        doc.rect(currentX, y, colWidths[4], hHeight);
        if (textValue(row[4])) {
          doc.text(textValue(row[4]), currentX + colWidths[4] - 2, y + 4, { align: "right" });
        }

        y += hHeight;
      });

      y += 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("2. Radiology", margin, y);
      y += 3.5;

      const radHeaders = ["Sl. No", "Imaging Modality", "Region", "Date", "Amount. Rs."];
      const radWidths = [15, 65, 50, 26, 30];
      const radTypes = [
        "Ultrasonography (U/S)",
        "Mammography",
        "MRI",
        "CT",
        "Doppler",
        "Echo",
        "PET Scan"
      ];

      const radRows = radTypes.map((rt, i) => {
        const item = expenses.find((e) => e.category === "Radiology" && e.item_type === rt);
        return [
          String.fromCharCode(97 + i),
          rt,
          item?.region || "",
          item ? normalizeDate(item.expense_date) : "",
          item ? money(item.amount) : ""
        ];
      });

      y = drawGridTable(radHeaders, radRows, radWidths, y) + 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("3. Scopy / Procedure", margin, y);
      y += 3.5;

      const scopyHeaders = ["Sl. No", "Procedure", "Region", "Date", "Amount. Rs."];
      const scopyWidths = [15, 65, 50, 26, 30];
      const scopyTypes = [
        { label: "Endoscopy", val: "Endoscopy" },
        { label: "Colonoscopy", val: "Colonoscopy" },
        { label: "Sigmoidoscopy", val: "Sigmoidoscopy" },
        { label: "Colposcopy", val: "Colposcopy" },
        { label: "Others", val: "Others" }
      ];

      const scopyRows = scopyTypes.map((st, i) => {
        const item = expenses.find((e) => e.category === "Scopy / Procedure" && e.item_type === st.val);
        return [
          String.fromCharCode(97 + i),
          st.label,
          item?.region || "",
          item ? normalizeDate(item.expense_date) : "",
          item ? money(item.amount) : ""
        ];
      });

      y = drawGridTable(scopyHeaders, scopyRows, scopyWidths, y) + 5;

      doc.addPage();
      drawHeader(2);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("IV. Minor Procedures.", margin, y);
      y += 3.5;

      const minorHeaders = ["Sl. No", "Name", "Region", "Date", "Amount. Rs."];
      const minorWidths = [15, 65, 50, 26, 30];
      const minorItems = [
        { key: "a", name: "Suturing" },
        { key: "b", name: "POP Application" },
        { key: "c", name: "Biopsy" },
        { key: "d", name: "Others" },
        { key: "e", name: "K. Wire fixation" }
      ];

      const minorRows = minorItems.map((mi) => {
        const item = expenses.find((e) => e.category === "Minor Procedure" && e.item_type === mi.name);
        return [mi.key, mi.name, item?.region || "", item ? normalizeDate(item.expense_date) : "", item ? money(item.amount) : ""];
      });

      y = drawGridTable(minorHeaders, minorRows, minorWidths, y) + 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("V. Appliances.", margin, y);
      y += 3.5;

      const appHeaders = ["Sl. No", "Name", "Region", "Date", "Amount. Rs."];
      const appWidths = [15, 65, 50, 26, 30];
      const appItems = [
        { key: "a", name: "Hearing Aid" },
        { key: "b", name: "O2 Concentrator" },
        { key: "c", name: "Calipers" },
        { key: "d", name: "Others" }
      ];

      const appRows = appItems.map((ai) => {
        const item = expenses.find((e) => e.category === "Appliance" && e.item_type === ai.name);
        return [ai.key, ai.name, item?.region || "", item ? normalizeDate(item.expense_date) : "", item ? money(item.amount) : ""];
      });

      y = drawGridTable(appHeaders, appRows, appWidths, y) + 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("For Office Use Only", pageWidth / 2, y, { align: "center" });
      y += 3.5;

      const officeHeaders = ["Sl. No", "Particulars", "CGHS Rate", "Sl. No", "Particulars", "CGHS Rate"];
      const officeWidths = [15, 58, 20, 15, 58, 20];
      const officeRows = [
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""]
      ];

      y = drawGridTable(officeHeaders, officeRows, officeWidths, y) + 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Ps:", margin, y);
      y += 3.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("1) All Claims should be done within 3 months of the Procedure / Consultations.", margin + 3, y);
      y += 3.5;
      doc.text("2) Reimbursement will be as per the CGHS rates only.", margin + 3, y);
      y += 3.5;
      doc.text("3) Medicines & Lab investigations will not be reimbursed.", margin + 3, y);
      y += 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(`Total Amount claimed: ${money(claim.total_amount)}`, margin, y);
      y += 4;
      doc.text(`Total number of enclosures: ${textValue(claim.total_enclosures)}`, margin, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("Declaration to be signed by the member of the staff.", pageWidth / 2, y, { align: "center" });
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const decLine1 = "I hereby declare that the statement made in this application are true to the best of my knowledge and that the";
      const decLine2 = "person for whom medical expenses were incurred is wholly dependent on me / that the medical expenses were incurred for";
      const decLine3 = "me.";

      doc.text(decLine1, margin, y);
      y += 3.8;
      doc.text(decLine2, margin, y);
      y += 3.8;
      doc.text(decLine3, margin, y);
      y += 7;

      doc.setFont("helvetica", "bold");
      doc.text(`Date: ${normalizeDate(claim.declaration_date)}`, margin, y);
      doc.text("Claimant Signature: __________________", pageWidth - margin - 65, y);
      y += 7;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Countersigned & clarified the claim:", margin, y);
      y += 3.8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("I) Is genuine.", margin, y);
      y += 3.5;
      doc.text("II) Is covered by the rules & orders of the Reimbursement Policy of the Institute Hospital.", margin, y);
      y += 3.5;
      doc.text("III) Is supported by the bills, receipt & others certificates etc.", margin, y);
      y += 3.5;
      doc.text("IV) Was not submitted before or sanctioned / countersigned by me.", margin, y);
      y += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("Medical officer / Consultants:", margin, y);
      doc.text("Chief Medical Officer", pageWidth - margin - 45, y);
      y += 3.8;
      doc.setFont("helvetica", "normal");
      doc.text("With Seal", margin, y);

      doc.save(`IITM-Medical-Claim-${textValue(claim.id)}.pdf`);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Unable to create the PDF. Please try again.");
    }
  };

  const renderHeaderLeft = (title, subtitle) => (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <button
        type="button"
        className="back-button"
        onClick={() => setShowNavigation(!showNavigation)}
        style={{ padding: "8px 12px", fontSize: "14px", margin: 0, height: "fit-content" }}
        title="Toggle Menu"
      >
        ☰ Menu
      </button>
      <IITMLogo size={68} />
      <div>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <p style={{ margin: "4px 0 0" }}>{subtitle}</p>
      </div>
    </div>
  );

  // =====================================================
  // REUSABLE CLAIM TABLE
  // =====================================================
  const renderClaimTable = (claimList, viewHandler, viewLabel = "View") => {
    const getStatusLabel = (status) => {
      if (status === "MO_APPROVED" || status === "DIRECT_TO_CMO") {
        return "Forwarded to CMO";
      }
      return status || "Pending";
    };

    return (
      <div style={{ overflowX: "auto", marginTop: "20px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "720px",
            background: "var(--card-bg, #ffffff)",
          }}
        >
          <thead>
            <tr>
              {["Claim ID", "Email ID", "Name", "Status", "View"].map((heading) => (
                <th
                  key={heading}
                  style={{
                    border: "1px solid var(--border-color, #ddd)",
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: "700",
                    whiteSpace: "nowrap",
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {claimList.map((claim) => (
              <tr key={claim.id}>
                <td style={{ border: "1px solid var(--border-color, #ddd)", padding: "12px", fontWeight: "600" }}>
                  #{claim.id}
                </td>
                <td style={{ border: "1px solid var(--border-color, #ddd)", padding: "12px" }}>
                  {claim.email || "-"}
                </td>
                <td style={{ border: "1px solid var(--border-color, #ddd)", padding: "12px" }}>
                  {claim.claimant_name || claim.username || "-"}
                </td>
                <td style={{ border: "1px solid var(--border-color, #ddd)", padding: "12px" }}>
                  {getStatusLabel(claim.status)}
                </td>
                <td style={{ border: "1px solid var(--border-color, #ddd)", padding: "12px" }}>
                  <button
                    type="button"
                    className="back-button"
                    onClick={() => viewHandler(claim)}
                  >
                    {viewLabel}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // =====================================================
  // NAVIGATION BAR COMPONENT
  // Clean fixed sidebar layout with smooth animations
  // =====================================================
  const renderNavigationBar = () => {
    const role = localStorage.getItem("user_role") || "STUDENT";

    const icon = (type, active = false) => {
      const stroke = active ? "#2563eb" : "#ffffff";
      const common = {
        width: 20,
        height: 20,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        style: { flexShrink: 0, transition: "stroke 0.25s ease" },
      };

      if (type === "home") return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M9 21v-7h6v7" />
        </svg>
      );
      if (type === "claims") return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
      if (type === "users") return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c.7-3.2 2.5-5 5.5-5s4.8 1.8 5.5 5" />
          <path d="M17 8v6M14 11h6" />
        </svg>
      );
      if (type === "profile") return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
        </svg>
      );
      return null;
    };

    const navButtons = [];

    if (role === "ADMIN") {
      navButtons.push(
        { label: "Home", target: "admin-dashboard", action: handleViewAdminDashboard, icon: "home" },
        { label: "All Users", target: "admin-users", icon: "users" },
        { label: "All Claims", target: "admin-claims", icon: "claims" },
        { label: "My Claims", target: "my-claims", action: handleViewClaims, icon: "claims" }
      );
    } else if (role === "CHIEF_MEDICAL_OFFICER") {
      navButtons.push(
        { label: "Home", target: "chief-dashboard", action: handleViewChiefDashboard, icon: "home" },
        { label: "Medical Officers", target: "chief-officers", icon: "users" },
        { label: "All Claims", target: "chief-claims", icon: "claims" },
        { label: "My Claims", target: "my-claims", action: handleViewClaims, icon: "claims" }
      );
    } else if (role === "MEDICAL_OFFICER") {
      navButtons.push(
        { label: "Home", target: "officer-dashboard", action: handleViewOfficerClaims, icon: "home" },
        { label: "All Claims", target: "officer-all-claims", icon: "claims" },
        { label: "Approved", target: "officer-approved-claims", icon: "claims" },
        { label: "Pending", target: "officer-pending-claims", icon: "claims" },
        { label: "Rejected", target: "officer-rejected-claims", icon: "claims" },
        { label: "My Claims", target: "my-claims", action: handleViewClaims, icon: "claims" }
      );
    } else {
      navButtons.push(
        { label: "Home", target: "dashboard", icon: "home" },
        { label: "My Claims", target: "my-claims", action: handleViewClaims, icon: "claims" }
      );
    }

    navButtons.push({
      label: "Create Claim",
      target: "medical-form",
      icon: "claims",
      action: async () => {
        const loaded = await loadAvailableMedicalOfficers();
        if (loaded) setPage("medical-form");
      },
    });

    navButtons.push({
      label: "Profile",
      target: "profile",
      icon: "profile",
      action: () => openProfile(getRoleDashboardPage()),
    });

    const runButton = (btn) => {
      if (btn.action) btn.action();
      else setPage(btn.target);
    };

    return (
      <aside
        className="app-navigation-sidebar"
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          bottom: "0",
          width: "240px",
          zIndex: 2000,
          boxSizing: "border-box",
          padding: "24px 14px 16px",
          background: "linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)",
          boxShadow: "4px 0 24px rgba(37, 99, 235, 0.22)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: 700,
            padding: "0 8px 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            letterSpacing: "0.5px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "15px", fontWeight: "600", opacity: 0.9 }}>Navigation Menu</span>
          </div>
          <button
            type="button"
            onClick={() => setShowNavigation(false)}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              color: "#ffffff",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title="Close navigation"
          >
            ✕
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {navButtons.map((btn, idx) => {
            const active = page === btn.target;
            return (
              <button
                key={`${btn.label}-${idx}`}
                type="button"
                onClick={() => runButton(btn)}
                title={btn.label}
                style={{
                  position: "relative",
                  width: "100%",
                  minHeight: "44px",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  background: active
                    ? "#ffffff"
                    : "transparent",
                  color: active ? "#2563eb" : "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  fontWeight: active ? "600" : "500",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: active
                    ? "0 4px 12px rgba(0, 0, 0, 0.12)"
                    : "none",
                  transform: active ? "translateX(4px)" : "translateX(0)",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
              >
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "20%",
                      bottom: "20%",
                      width: "4px",
                      borderRadius: "0 4px 4px 0",
                      background: "#2563eb",
                      transition: "all 0.2s ease",
                    }}
                  />
                )}
                {icon(btn.icon, active)}
                <span style={{ flex: 1 }}>{btn.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", minHeight: "18px" }} />
      </aside>
    );
  };

  const mainContentStyle = {
    width: "100%",
    maxWidth: showNavigation ? "calc(100% - 240px)" : "100%",
    marginLeft: showNavigation ? "240px" : "0",
    boxSizing: "border-box",
    transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const headerStyle = {
    width: "100%",
    maxWidth: showNavigation ? "calc(100% - 240px)" : "100%",
    marginLeft: showNavigation ? "240px" : "0",
    boxSizing: "border-box",
    borderRadius: 0,
    marginTop: 0,
    transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  if (page === "officer-review" && officerSelectedClaim) {
    const claim = officerSelectedClaim;

    return (
      <div
        className="dashboard-page"
        style={{
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("Medical Claim Review", "Medical Officer • Complete Medical Claim Details")}

          <div className="header-actions">
            <button
              type="button"
              className="back-button"
              onClick={() => {
                setOfficerSelectedClaim(null);
                setOfficerRemarks("");
                setPage("officer-dashboard");
              }}
            >
              Back to Claims
            </button>
            <button
              type="button"
              className="back-button"
              onClick={() =>
                downloadClaimAsPDF(claim, "Medical Officer")
              }
            >
              Download PDF
            </button>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {showNavigation && renderNavigationBar()}

        <main
          className="dashboard-content"
          style={{ ...mainContentStyle, paddingBottom: "50px" }}
        >
          <div className="welcome-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span className="medical-badge">
                  Medical Officer Review
                </span>
                <h2 style={{ marginBottom: "6px" }}>
                  Medical Claim #{claim.id}
                </h2>
                <p style={{ marginTop: 0 }}>
                  Review the complete claim information before approving or rejecting it.
                </p>
              </div>

              <span
                style={{
                  display: "inline-block",
                  fontWeight: "bold",
                  padding: "8px 14px",
                  borderRadius: "20px",
                  background:
                    ["Approved", "AUTHORIZED"].includes(claim.status)
                      ? "#d4edda"
                      : claim.status === "Rejected"
                        ? "#f8d7da"
                        : "#fff3cd",
                  color:
                    ["Approved", "AUTHORIZED"].includes(claim.status)
                      ? "#155724"
                      : claim.status === "Rejected"
                        ? "#721c24"
                        : "#856404",
                }}
              >
                {claim.status || "Pending"}
              </span>
            </div>

            <h3 style={{ marginTop: "25px" }}>
              1. Claimant Information
            </h3>

            <div className="form-grid">
              <div>
                <label>Username</label>
                <input value={claim.username || ""} readOnly />
              </div>

              <div>
                <label>Email</label>
                <input value={claim.email || ""} readOnly />
              </div>

              <div>
                <label>Claimant Name</label>
                <input value={claim.claimant_name || ""} readOnly />
              </div>

              <div>
                <label>ID No.</label>
                <input value={claim.id_no || ""} readOnly />
              </div>

              <div>
                <label>Designation</label>
                <input value={claim.designation || ""} readOnly />
              </div>

              <div>
                <label>Department</label>
                <input value={claim.department || ""} readOnly />
              </div>

              <div>
                <label>Mobile No.</label>
                <input value={claim.mobile_no || ""} readOnly />
              </div>
            </div>

            <h3 style={{ marginTop: "25px" }}>
              2. Patient Information
            </h3>

            <div className="form-grid">
              <div>
                <label>Patient Name</label>
                <input value={claim.patient_name || ""} readOnly />
              </div>

              <div>
                <label>Patient Age</label>
                <input value={claim.patient_age ?? ""} readOnly />
              </div>

              <div>
                <label>Relationship</label>
                <input value={claim.relationship || ""} readOnly />
              </div>

              <div>
                <label>Medical Officer</label>
                <input value={claim.medical_officer || ""} readOnly />
              </div>

              <div>
                <label>Referral Date</label>
                <input
                  value={normalizeDate(claim.referral_date)}
                  readOnly
                />
              </div>

              <div>
                <label>Referral Hospital</label>
                <input
                  value={claim.referral_hospital || ""}
                  readOnly
                />
              </div>
            </div>

            <h3 style={{ marginTop: "25px" }}>
              3. Medical Expenses
            </h3>

            {claim.expenses && claim.expenses.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "850px",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Category
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Type
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Consultant
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Specialty
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Region
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Date
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {claim.expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {expense.category}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {expense.item_type || "-"}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {expense.consultant || "-"}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {expense.specialty || "-"}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {expense.region || "-"}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {normalizeDate(expense.expense_date) || "-"}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          ₹{expense.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No expense details available.</p>
            )}

            <h3 style={{ marginTop: "25px" }}>
              4. Claim Summary
            </h3>

            <div className="form-grid">
              <div>
                <label>Total Amount</label>
                <input
                  value={`₹${claim.total_amount ?? 0}`}
                  readOnly
                />
              </div>

              <div>
                <label>Total Enclosures</label>
                <input
                  value={claim.total_enclosures ?? 0}
                  readOnly
                />
              </div>

              <div>
                <label>Declaration</label>
                <input
                  value={claim.declaration ? "Accepted" : "Not Accepted"}
                  readOnly
                />
              </div>

              <div>
                <label>Declaration Date</label>
                <input
                  value={normalizeDate(claim.declaration_date)}
                  readOnly
                />
              </div>

              <div>
                <label>CAPTCHA Verification</label>
                <input
                  value={claim.signature || ""}
                  readOnly
                />
              </div>

              <div>
                <label>Submitted At</label>
                <input
                  value={claim.created_at || ""}
                  readOnly
                />
              </div>

              <div>
                <label>Reviewed At</label>
                <input
                  value={claim.reviewed_at || "Not reviewed yet"}
                  readOnly
                />
              </div>
            </div>

            <h3 style={{ marginTop: "25px" }}>
              Supporting Documents
            </h3>
            {claim.documents && claim.documents.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", marginTop: "12px" }}>
                {claim.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color, #e2e8f0)",
                      background: "var(--card-bg, #f8fafc)",
                    }}
                  >
                    <div style={{ overflow: "hidden", paddingRight: "10px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#2563eb",
                          textTransform: "uppercase",
                          marginBottom: "2px",
                        }}
                      >
                        {doc.document_type ? doc.document_type.replace(/_/g, " ") : "Document"}
                      </span>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: "500",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {doc.original_filename}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="back-button"
                      onClick={() => openDocumentInNewTab(doc.id)}
                      style={{ padding: "6px 12px", fontSize: "12px", flexShrink: 0 }}
                    >
                      👁️ View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No supporting documents uploaded for this claim.</p>
            )}

            {claim.officer_remarks && (
              <div style={{ marginTop: "20px" }}>
                <label>Previous Officer Remarks</label>
                <textarea
                  value={claim.officer_remarks}
                  readOnly
                  rows="3"
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            <h3 style={{ marginTop: "25px" }}>
              5. Medical Officer Review
            </h3>

            <label>Remarks</label>
            <textarea
              value={officerRemarks}
              onChange={(e) => setOfficerRemarks(e.target.value)}
              placeholder="Enter remarks for this claim"
              rows="5"
              style={{
                width: "100%",
                marginTop: "8px",
                padding: "12px",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  handleOfficerReview(claim.id, "approve")
                }
                disabled={claim.status !== "Pending"}
              >
                Approve
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() =>
                  handleOfficerReview(claim.id, "send-direct-cmo")
                }
                disabled={claim.status !== "Pending"}
              >
                Forward to CMO
              </button>

              <button
                type="button"
                className="logout-button"
                onClick={() =>
                  handleOfficerReview(claim.id, "reject")
                }
                disabled={["Rejected", "AUTHORIZED", "Approved"].includes(claim.status)}
              >
                Reject Claim
              </button>

            </div>
          </div>
        </main>
      </div>
    );
  }

  if (page === "chief-review" && chiefSelectedClaim) {
    const claim = chiefSelectedClaim;

    return (
      <div
        className="dashboard-page"
        style={{
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("Medical Claim Review", "Chief Medical Officer • Complete Medical Claim Details")}

          <div className="header-actions">
            <button
              type="button"
              className="back-button"
              onClick={() => {
                setChiefSelectedClaim(null);
                setChiefRemarks("");
                setPage("chief-dashboard");
              }}
            >
              Back to Claims
            </button>
            <button
              type="button"
              className="back-button"
              onClick={() =>
                downloadClaimAsPDF(claim, "Chief Medical Officer")
              }
            >
              Download PDF
            </button>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {showNavigation && renderNavigationBar()}

        <main
          className="dashboard-content"
          style={{ ...mainContentStyle, paddingBottom: "50px" }}
        >
          <div className="welcome-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span className="medical-badge">
                  Chief Medical Officer Review
                </span>
                <h2 style={{ marginBottom: "6px" }}>
                  Medical Claim #{claim.id}
                </h2>
                <p style={{ marginTop: 0 }}>
                  Complete claim information for final medical review.
                </p>
              </div>

              <span
                style={{
                  display: "inline-block",
                  fontWeight: "bold",
                  padding: "8px 14px",
                  borderRadius: "20px",
                  background:
                    ["Approved", "AUTHORIZED"].includes(claim.status)
                      ? "#d4edda"
                      : claim.status === "Rejected"
                        ? "#f8d7da"
                        : "#fff3cd",
                  color:
                    ["Approved", "AUTHORIZED"].includes(claim.status)
                      ? "#155724"
                      : claim.status === "Rejected"
                        ? "#721c24"
                        : "#856404",
                }}
              >
                {claim.status || "Pending"}
              </span>
            </div>

            <h3 style={{ marginTop: "25px" }}>
              1. Claimant Information
            </h3>

            <div className="form-grid">
              <div>
                <label>Username</label>
                <input value={claim.username || ""} readOnly />
              </div>

              <div>
                <label>Email</label>
                <input value={claim.email || ""} readOnly />
              </div>

              <div>
                <label>Claimant Name</label>
                <input value={claim.claimant_name || ""} readOnly />
              </div>

              <div>
                <label>ID No.</label>
                <input value={claim.id_no || ""} readOnly />
              </div>

              <div>
                <label>Designation</label>
                <input value={claim.designation || ""} readOnly />
              </div>

              <div>
                <label>Department</label>
                <input value={claim.department || ""} readOnly />
              </div>

              <div>
                <label>Mobile No.</label>
                <input value={claim.mobile_no || ""} readOnly />
              </div>
            </div>

            <h3 style={{ marginTop: "25px" }}>
              2. Patient Information
            </h3>

            <div className="form-grid">
              <div>
                <label>Patient Name</label>
                <input value={claim.patient_name || ""} readOnly />
              </div>

              <div>
                <label>Patient Age</label>
                <input value={claim.patient_age ?? ""} readOnly />
              </div>

              <div>
                <label>Relationship</label>
                <input value={claim.relationship || ""} readOnly />
              </div>

              <div>
                <label>Medical Officer</label>
                <input value={claim.medical_officer || ""} readOnly />
              </div>

              <div>
                <label>Referral Date</label>
                <input
                  value={normalizeDate(claim.referral_date)}
                  readOnly
                />
              </div>

              <div>
                <label>Referral Hospital</label>
                <input
                  value={claim.referral_hospital || ""}
                  readOnly
                />
              </div>
            </div>

            <h3 style={{ marginTop: "25px" }}>
              3. Medical Expenses
            </h3>

            {claim.expenses && claim.expenses.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "850px",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Category
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Type
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Consultant
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Specialty
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Region
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Date
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {claim.expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {expense.category}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {expense.item_type || "-"}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {expense.consultant || "-"}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {expense.specialty || "-"}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {expense.region || "-"}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {normalizeDate(expense.expense_date) || "-"}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          ₹{expense.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No expense details available.</p>
            )}

            <h3 style={{ marginTop: "25px" }}>
              4. Claim Summary
            </h3>

            <div className="form-grid">
              <div>
                <label>Total Amount</label>
                <input
                  value={`₹${claim.total_amount ?? 0}`}
                  readOnly
                />
              </div>

              <div>
                <label>Total Enclosures</label>
                <input
                  value={claim.total_enclosures ?? 0}
                  readOnly
                />
              </div>

              <div>
                <label>Declaration</label>
                <input
                  value={claim.declaration ? "Accepted" : "Not Accepted"}
                  readOnly
                />
              </div>

              <div>
                <label>Declaration Date</label>
                <input
                  value={normalizeDate(claim.declaration_date)}
                  readOnly
                />
              </div>

              <div>
                <label>CAPTCHA Verification</label>
                <input
                  value={claim.signature || ""}
                  readOnly
                />
              </div>

              <div>
                <label>Submitted At</label>
                <input
                  value={claim.created_at || ""}
                  readOnly
                />
              </div>

              <div>
                <label>Reviewed At</label>
                <input
                  value={claim.reviewed_at || "Not reviewed yet"}
                  readOnly
                />
              </div>
            </div>

            <h3 style={{ marginTop: "25px" }}>
              Supporting Documents
            </h3>
            {claim.documents && claim.documents.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", marginTop: "12px" }}>
                {claim.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color, #e2e8f0)",
                      background: "var(--card-bg, #f8fafc)",
                    }}
                  >
                    <div style={{ overflow: "hidden", paddingRight: "10px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#2563eb",
                          textTransform: "uppercase",
                          marginBottom: "2px",
                        }}
                      >
                        {doc.document_type ? doc.document_type.replace(/_/g, " ") : "Document"}
                      </span>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: "500",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {doc.original_filename}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="back-button"
                      onClick={() => openDocumentInNewTab(doc.id)}
                      style={{ padding: "6px 12px", fontSize: "12px", flexShrink: 0 }}
                    >
                      👁️ View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No supporting documents uploaded for this claim.</p>
            )}

            {claim.officer_remarks && (
              <div style={{ marginTop: "20px" }}>
                <label>Medical Officer Remarks</label>
                <textarea
                  value={claim.officer_remarks}
                  readOnly
                  rows="3"
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            <h3 style={{ marginTop: "25px" }}>
              5. Chief Medical Officer Review
            </h3>

            <label>Remarks</label>
            <textarea
              value={chiefRemarks}
              onChange={(e) => setChiefRemarks(e.target.value)}
              placeholder="Enter review remarks"
              rows="5"
              style={{
                width: "100%",
                marginTop: "8px",
                padding: "12px",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  handleChiefReview(claim.id, "approve-authorize")
                }
                disabled={!['MO_APPROVED', 'DIRECT_TO_CMO', 'Pending'].includes(claim.status)}
              >
                Approve
              </button>

              <button
                type="button"
                className="logout-button"
                onClick={() =>
                  handleChiefReview(claim.id, "reject")
                }
                disabled={["Rejected", "AUTHORIZED", "Approved"].includes(claim.status)}
              >
                Reject Claim
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setChiefSelectedClaim(null);
                  setChiefRemarks("");
                  setPage("chief-dashboard");
                }}
              >
                Close Review
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (page === "profile") {
    const username =
      profileData.username ||
      localStorage.getItem("username") ||
      "User";

    const email =
      profileData.email ||
      "Email not available";

    const storedRole =
      profileData.role ||
      localStorage.getItem("user_role") ||
      "STUDENT";

    const roleNames = {
      STUDENT: "User",
      MEDICAL_OFFICER: "Medical Officer",
      CHIEF_MEDICAL_OFFICER: "Chief Medical Officer",
      ADMIN: "Administrator",
    };

    const roleName = roleNames[storedRole] || "User";

    const handleProfilePhotoChange = (event) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("Please select an image smaller than 2 MB.");
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const photo = reader.result;

        setProfilePhoto(photo);

        localStorage.setItem(
          `profile_photo_${username}`,
          photo
        );
      };

      reader.readAsDataURL(file);
    };

    const handleDeleteProfilePhoto = () => {
      if (!profilePhoto) {
        return;
      }

      if (!window.confirm("Delete your profile photo?")) {
        return;
      }

      localStorage.removeItem(
        `profile_photo_${username}`
      );

      setProfilePhoto("");
    };

    return (
      <div className="dashboard-page">
        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("User Profile", "Manage your account credentials and personal information")}

          <div className="header-actions">
            <button
              type="button"
              className="back-button"
              onClick={() => setPage(profileReturnPage)}
            >
              Back to Dashboard
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>
          <section className="welcome-card" style={{ padding: "32px", borderRadius: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                flexWrap: "wrap",
                paddingBottom: "24px",
                borderBottom: "1px solid var(--border-color, #e2e8f0)",
              }}
            >
              <div
                className="profile-avatar"
                style={{
                  width: "110px",
                  height: "110px",
                  minWidth: "110px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "38px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#ffffff",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                  border: "3px solid #ffffff",
                }}
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  username.charAt(0).toUpperCase()
                )}
              </div>

              <div style={{ flex: "1", minWidth: "220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ margin: "0", fontSize: "26px", fontWeight: "700" }}>{username}</h2>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      background: "#e0e7ff",
                      color: "#3730a3",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {roleName}
                  </span>
                </div>
                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>
                  {email || "No email address provided"}
                </p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
                  <label
                    htmlFor="profile-photo-upload"
                    className="back-button"
                    style={{
                      cursor: "pointer",
                      display: "inline-block",
                      padding: "8px 16px",
                      fontSize: "13px",
                      margin: 0,
                    }}
                  >
                    {profilePhoto ? "Change Photo" : "Upload Photo"}
                  </label>

                  {profilePhoto && (
                    <button
                      type="button"
                      className="logout-button"
                      onClick={handleDeleteProfilePhoto}
                      style={{ padding: "8px 16px", fontSize: "13px" }}
                    >
                      Remove Photo
                    </button>
                  )}

                  <input
                    id="profile-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: "28px" }}>
              <h3 style={{ margin: "0 0 18px", fontSize: "18px", color: "var(--heading-color, #1e293b)" }}>
                Account Information Details
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #e2e8f0)",
                    background: "var(--card-bg, #f8fafc)",
                  }}
                >
                  <span style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Username
                  </span>
                  <strong style={{ fontSize: "15px", display: "block", marginTop: "4px" }}>{username}</strong>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #e2e8f0)",
                    background: "var(--card-bg, #f8fafc)",
                  }}
                >
                  <span style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Email Address
                  </span>
                  <strong style={{ fontSize: "15px", display: "block", marginTop: "4px" }}>{email}</strong>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #e2e8f0)",
                    background: "var(--card-bg, #f8fafc)",
                  }}
                >
                  <span style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Assigned Role
                  </span>
                  <strong style={{ fontSize: "15px", display: "block", marginTop: "4px" }}>{roleName}</strong>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #e2e8f0)",
                    background: "var(--card-bg, #f8fafc)",
                  }}
                >
                  <span style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    System Portal
                  </span>
                  <strong style={{ fontSize: "15px", display: "block", marginTop: "4px" }}>IITM Medical Portal</strong>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (page === "admin-dashboard") {
    const stats = adminStats || {};

    return (
      <div className="dashboard-page">
        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("Admin Dashboard", "Manage users, roles and medical claims")}

          <div className="header-actions">
            <button
              type="button"
              className="profile-header-button"
              onClick={() => openProfile("admin-dashboard")}
            >
              Profile
            </button>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>

          <div className="welcome-card">
            <h2>System Overview</h2>

            <div className="form-grid">
              <div>
                <strong>Total Users</strong>
                <h2>{stats.total_users ?? 0}</h2>
              </div>

              <div>
                <strong>Users</strong>
                <h2>{stats.total_students ?? 0}</h2>
              </div>

              <div>
                <strong>Medical Officers</strong>
                <h2>{stats.total_medical_officers ?? 0}</h2>
              </div>

              <div>
                <strong>Chief Medical Officers</strong>
                <h2>{stats.total_chief_officers ?? 0}</h2>
              </div>

              <div>
                <strong>Admins</strong>
                <h2>{stats.total_admins ?? 0}</h2>
              </div>

              <div>
                <strong>Total Claims</strong>
                <h2>{stats.total_claims ?? 0}</h2>
              </div>

              <div>
                <strong>Pending Claims</strong>
                <h2>{stats.pending_claims ?? 0}</h2>
              </div>

              <div>
                <strong>Approved Claims</strong>
                <h2>{stats.approved_claims ?? 0}</h2>
              </div>

              <div>
                <strong>Rejected Claims</strong>
                <h2>{stats.rejected_claims ?? 0}</h2>
              </div>
            </div>
          </div>

          <div className="welcome-card">
            <h2>Personal Medical Reimbursement Claims</h2>
            <p>Create and submit your own medical claims or view your personal claims.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="back-button"
                onClick={async () => {
                  const loaded = await loadAvailableMedicalOfficers();
                  if (loaded) {
                    setDocumentFiles({
                      original_bill: [],
                      receipt: [],
                      reports: [],
                      iitm_hospital_referral: [],
                    });
                    setPage("medical-form");
                  }
                }}
              >
                Create Claim
              </button>
              <button
                type="button"
                className="back-button"
                onClick={handleViewClaims}
              >
                My Personal Claims
              </button>
            </div>
          </div>

          <div className="welcome-card">
            <h2>User Management</h2>
            <p>
              Open complete user information and role management on a separate page.
            </p>

            <button
              type="button"
              className="back-button"
              onClick={() => setPage("admin-users")}
            >
              View All Users
            </button>
          </div>

          <div className="welcome-card">
            <h2>Medical Claims</h2>
            <p>
              Open complete medical claim information on a separate page.
            </p>

            <button
              type="button"
              className="back-button"
              onClick={() => setPage("admin-claims")}
            >
              View All Medical Claims
            </button>
          </div>

          <div className="submit-area">
            <button
              type="button"
              className="back-button"
              onClick={handleViewAdminDashboard}
            >
              Refresh Dashboard
            </button>
          </div>


          <div className="welcome-card" style={{ marginTop: "20px" }}>
            <h2>Medical Claims List</h2>
            <p>Claim ID, Email ID, Name, Status and View</p>
            {adminClaims.length === 0 ? (
              <p>No medical claims found.</p>
            ) : (
              renderClaimTable(adminClaims, (claim) => handleAdminViewClaim(claim), "View Claim")
            )}
          </div>

        </main>
      </div>
    );
  }

  if (page === "admin-users") {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("All Users", "Complete user information and role management")}

          <div className="header-actions">
            <button
              type="button"
              className="profile-header-button"
              onClick={() => openProfile("admin-dashboard")}
            >
              Profile
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>
          <div className="welcome-card">
            <button
              type="button"
              className="back-button"
              onClick={() => setPage("admin-dashboard")}
            >
              Back to Admin Dashboard
            </button>

            <h2 style={{ marginTop: "20px" }}>User List</h2>

            {adminUsers.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "10px", textAlign: "left" }}>ID</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Username</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Email</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Role</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((user) => (
                      <tr key={user.id}>
                        <td style={{ padding: "10px" }}>{user.id}</td>
                        <td style={{ padding: "10px" }}>{user.username}</td>
                        <td style={{ padding: "10px" }}>{user.email}</td>
                        <td style={{ padding: "10px" }}>
                          <strong>
                            {user.role === "STUDENT" ? "User" : user.role}
                          </strong>
                        </td>
                        <td style={{ padding: "10px" }}>
                          <button
                            type="button"
                            className="back-button"
                            onClick={() => {
                              setAdminSelectedUser(user);
                              setPage("admin-user-detail");
                            }}
                          >
                            View User Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (page === "admin-user-detail" && adminSelectedUser) {
    const user = adminSelectedUser;

    return (
      <div className="dashboard-page">
        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("User Details", "Complete account information")}

          <button
            type="button"
            className="back-button"
            onClick={() => setPage("admin-users")}
          >
            Back
          </button>
        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>
          <div className="welcome-card">
            <h2>{user.username}</h2>

            <div className="form-grid">
              <div>
                <label>User ID</label>
                <input value={user.id ?? ""} readOnly />
              </div>
              <div>
                <label>Username</label>
                <input value={user.username || ""} readOnly />
              </div>
              <div>
                <label>Email</label>
                <input value={user.email || ""} readOnly />
              </div>
              <div>
                <label>Role</label>
                <input
                  value={user.role === "STUDENT" ? "User" : user.role || ""}
                  readOnly
                />
              </div>
              <div>
                <label>LDAP DN</label>
                <input value={user.ldap_dn || ""} readOnly />
              </div>
              <div>
                <label>Created At</label>
                <input value={user.created_at || ""} readOnly />
              </div>
            </div>

            {user.role !== "ADMIN" && (
              <div className="submit-area" style={{ marginTop: "20px" }}>
                <select
                  value={adminRoleChanges[user.id] || ""}
                  onChange={(e) =>
                    setAdminRoleChanges({
                      ...adminRoleChanges,
                      [user.id]: e.target.value,
                    })
                  }
                >
                  <option value="">Select role</option>
                  <option value="STUDENT">User</option>
                  <option value="MEDICAL_OFFICER">Medical Officer</option>
                  <option value="CHIEF_MEDICAL_OFFICER">
                    Chief Medical Officer
                  </option>
                </select>

                <button
                  type="button"
                  className="back-button"
                  onClick={() => handleAdminChangeRole(user.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Update Role
                </button>

                <button
                  type="button"
                  className="logout-button"
                  onClick={() => handleAdminDeactivateUser(user.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Deactivate
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (page === "admin-claims") {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("All Medical Claims", "Complete medical claim information")}
          <div className="header-actions">
            <button
              type="button"
              className="profile-header-button"
              onClick={() => openProfile("admin-dashboard")}
            >
              Profile
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>
          <div className="welcome-card">
            <button
              type="button"
              className="back-button"
              onClick={() => setPage("admin-dashboard")}
            >
              Back to Admin Dashboard
            </button>

            <h2 style={{ marginTop: "20px" }}>Medical Claims</h2>

            {adminClaims.length === 0 ? (
              <p>No medical claims found.</p>
            ) : (
              renderClaimTable(
                adminClaims,
                (claim) => handleAdminViewClaim(claim),
                "View Claim"
              )
            )}
          </div>
        </main>
      </div>
    );
  }


  if (page === "admin-claim" && adminSelectedClaim) {
    const claim = adminSelectedClaim;
    const expenses = claim.expenses || [];

    return (
      <div className="form-page">
        <header className="form-header" style={headerStyle}>
          {renderHeaderLeft("IITM Medical Claim", `Admin View - Claim #${claim.id}`)}
          <button
            className="back-button"
            onClick={() => setPage("admin-dashboard")}
          >
            Back to Admin Dashboard
          </button>
          <button
            type="button"
            className="back-button"
            onClick={() =>
              downloadClaimAsPDF(claim, "Admin")
            }
          >
            Download PDF
          </button>
        </header>

        {showNavigation && renderNavigationBar()}

        <main className="medical-form-container" style={mainContentStyle}>

          <section className="form-section">
            <h2>Claim Status</h2>

            <div className="form-grid">
              <div>
                <label>Status</label>
                <input
                  value={claim.status || "Pending"}
                  readOnly
                />
              </div>

              <div>
                <label>Student Username</label>
                <input
                  value={claim.username || ""}
                  readOnly
                />
              </div>

              <div>
                <label>Medical Officer</label>
                <input
                  value={claim.medical_officer || ""}
                  readOnly
                />
              </div>

              <div>
                <label>Officer Remarks</label>
                <input
                  value={claim.officer_remarks || ""}
                  readOnly
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>1. Information of the Claimant</h2>

            <div className="form-grid">
              <div>
                <label>Claimant Name</label>
                <input
                  value={claim.claimant_name || ""}
                  readOnly
                />
              </div>

              <div>
                <label>ID No.</label>
                <input
                  value={claim.id_no || ""}
                  readOnly
                />
              </div>

              <div>
                <label>Designation</label>
                <input
                  value={claim.designation || ""}
                  readOnly
                />
              </div>

              <div>
                <label>Department</label>
                <input
                  value={claim.department || ""}
                  readOnly
                />
              </div>

              <div>
                <label>Mobile No.</label>
                <input
                  value={claim.mobile_no || ""}
                  readOnly
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>2. Information of the Patient</h2>

            <div className="form-grid">
              <div>
                <label>Patient Name</label>
                <input
                  value={claim.patient_name || ""}
                  readOnly
                />
              </div>

              <div>
                <label>Age</label>
                <input
                  value={claim.patient_age ?? ""}
                  readOnly
                />
              </div>

              <div>
                <label>Relationship to Claimant</label>
                <input
                  value={claim.relationship || ""}
                  readOnly
                />
              </div>

              <div>
                <label>Referral Date</label>
                <input
                  value={normalizeDate(claim.referral_date)}
                  readOnly
                />
              </div>

              <div>
                <label>Referral Hospital / Clinic / Diagnostic Centre</label>
                <input
                  value={claim.referral_hospital || ""}
                  readOnly
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>3. Medical Expenses</h2>

            {expenses.length === 0 ? (
              <p>No medical expenses recorded.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse"
                }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "10px", textAlign: "left" }}>
                        Category
                      </th>
                      <th style={{ padding: "10px", textAlign: "left" }}>
                        Type
                      </th>
                      <th style={{ padding: "10px", textAlign: "left" }}>
                        Consultant
                      </th>
                      <th style={{ padding: "10px", textAlign: "left" }}>
                        Specialty
                      </th>
                      <th style={{ padding: "10px", textAlign: "left" }}>
                        Region
                      </th>
                      <th style={{ padding: "10px", textAlign: "left" }}>
                        Date
                      </th>
                      <th style={{ padding: "10px", textAlign: "left" }}>
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td style={{ padding: "10px" }}>
                          {expense.category}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {expense.item_type || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {expense.consultant || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {expense.specialty || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {expense.region || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {normalizeDate(expense.expense_date)}
                        </td>
                        <td style={{ padding: "10px" }}>
                          ₹{expense.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="form-section">
            <h2>4. Claim Summary</h2>

            <div className="form-grid">
              <div>
                <label>Total Amount Claimed</label>
                <input
                  value={`₹${claim.total_amount ?? 0}`}
                  readOnly
                />
              </div>

              <div>
                <label>Total Enclosures</label>
                <input
                  value={claim.total_enclosures ?? ""}
                  readOnly
                />
              </div>

              <div>
                <label>Declaration Date</label>
                <input
                  value={normalizeDate(claim.declaration_date)}
                  readOnly
                />
              </div>

              <div>
                <label>CAPTCHA Verification</label>
                <input
                  value={claim.signature || ""}
                  readOnly
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Supporting Documents</h2>
            {claim.documents && claim.documents.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", marginTop: "12px" }}>
                {claim.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color, #e2e8f0)",
                      background: "var(--card-bg, #f8fafc)",
                    }}
                  >
                    <div style={{ overflow: "hidden", paddingRight: "10px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#2563eb",
                          textTransform: "uppercase",
                          marginBottom: "2px",
                        }}
                      >
                        {doc.document_type ? doc.document_type.replace(/_/g, " ") : "Document"}
                      </span>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: "500",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {doc.original_filename}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="back-button"
                      onClick={() => openDocumentInNewTab(doc.id)}
                      style={{ padding: "6px 12px", fontSize: "12px", flexShrink: 0 }}
                    >
                      👁️ View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No supporting documents uploaded for this claim.</p>
            )}
          </section>

          <section className="form-section">
            <h2>5. Admin Review</h2>

            <label>Remarks</label>
            <textarea
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              placeholder="Enter remarks for this claim"
              rows="4"
              style={{
                width: "100%",
                marginTop: "8px",
                marginBottom: "15px",
                padding: "10px",
                boxSizing: "border-box",
              }}
            />

            <div className="submit-area">
              <button
                type="button"
                className="back-button"
                onClick={() => handleAdminReview(claim.id, "approve")}
                disabled={["AUTHORIZED", "Approved", "Rejected"].includes(claim.status)}
              >
                Approve
              </button>

              <button
                type="button"
                className="logout-button"
                onClick={() => handleAdminReview(claim.id, "reject")}
                disabled={["Approved", "AUTHORIZED"].includes(claim.status) || claim.status === "Rejected"}
                style={{ marginLeft: "10px" }}
              >
                Reject Claim
              </button>
            </div>
          </section>

          <div className="submit-area">
            <button
              type="button"
              className="back-button"
              onClick={() => {
                setAdminSelectedClaim(null);
                setAdminRemarks("");
                setPage("admin-dashboard");
              }}
            >
              Back to Admin Dashboard
            </button>
          </div>

        </main>
      </div>
    );
  }

  if (page === "login") {
    return (
      <div className="login-page">

        <div className="login-card">

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <IITMLogo size={82} />
          </div>

          <h2>Medical Form</h2>

          <h3>Login</h3>

          <form onSubmit={handleLogin}>

            <label>
              Username
            </label>

            <input
              type="text"
              value={loginData.username}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  username:
                    e.target.value,
                })
              }
              required
            />

            <div
              style={{
                marginBottom: "15px",
                padding: "10px",
                borderRadius: "8px",
                background: "var(--card-bg, #f4f6f8)",
                fontSize: "14px",
              }}
            >
              Dashboard access is assigned by your
              account role.
            </div>

            <label>
              Password
            </label>

            <input
              type="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  password:
                    e.target.value,
                })
              }
              required
            />

            <button type="submit">
              Login
            </button>

          </form>

          <p className="switch-text">
            Don't have an account?

            <button
              className="link-button"
              onClick={() =>
                setPage("signup")
              }
            >
              Signup
            </button>
          </p>

        </div>

      </div>
    );
  }

  if (page === "signup") {
    return (
      <div className="login-page">

        <div className="login-card">

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <IITMLogo size={82} />
          </div>

          <h2>Medical Form</h2>

          <h3>Signup</h3>

          <form onSubmit={handleSignup}>

            <label>
              Username
            </label>

            <input
              type="text"
              value={signupData.username}
              onChange={(e) =>
                setSignupData({
                  ...signupData,
                  username:
                    e.target.value,
                })
              }
              required
            />

            <label>
              Email
            </label>

            <input
              type="email"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({
                  ...signupData,
                  email:
                    e.target.value,
                })
              }
              required
            />

            <label>
              Password
            </label>

            <input
              type="password"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({
                  ...signupData,
                  password:
                    e.target.value,
                })
              }
              required
            />

            <button type="submit">
              Signup
            </button>

          </form>

          <p className="switch-text">
            Already have an account?

            <button
              className="link-button"
              onClick={() =>
                setPage("login")
              }
            >
              Login
            </button>
          </p>

        </div>

      </div>
    );
  }

  if (
    page === "full-claim" &&
    selectedClaim
  ) {

    const claim =
      selectedClaim;

    const expenses =
      claim.expenses || [];

    const consultationExpenses =
      expenses.filter(
        (item) =>
          item.category ===
          "Consultation"
      );

    const radiologyExpenses =
      expenses.filter(
        (item) =>
          item.category ===
          "Radiology"
      );

    const scopyExpenses =
      expenses.filter(
        (item) =>
          item.category ===
          "Scopy / Procedure"
      );

    const minorExpenses =
      expenses.filter(
        (item) =>
          item.category ===
          "Minor Procedure"
      );

    const applianceExpenses =
      expenses.filter(
        (item) =>
          item.category ===
          "Appliance"
      );

    return (
      <div className="form-page">

        <header className="form-header" style={headerStyle}>
          {renderHeaderLeft("IITM Medical Claim Form", `Submitted Claim #${claim.id}`)}

          <button
            className="back-button"
            onClick={() =>
              setPage("my-claims")
            }
          >
            Back to Claims
          </button>
          <button
            type="button"
            className="back-button"
            onClick={() =>
              downloadClaimAsPDF(claim, "Student")
            }
          >
            Download PDF
          </button>

        </header>

        {showNavigation && renderNavigationBar()}

        <main className="medical-form-container" style={mainContentStyle}>

          <section className="form-section">

            <h2>
              1. Information of the Claimant
            </h2>

            <div className="form-grid">

              <div>
                <label>
                  Claimant Name
                </label>

                <input
                  value={
                    claim.claimant_name || ""
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  ID No.
                </label>

                <input
                  value={
                    claim.id_no || ""
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Designation
                </label>

                <input
                  value={
                    claim.designation || ""
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Department
                </label>

                <input
                  value={
                    claim.department || ""
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Mobile No.
                </label>

                <input
                  value={
                    claim.mobile_no || ""
                  }
                  readOnly
                />
              </div>

            </div>

          </section>

          <section className="form-section">

            <h2>
              2. Information of the Patient
            </h2>

            <div className="form-grid">

              <div>
                <label>
                  Patient Name
                </label>

                <input
                  value={
                    claim.patient_name || ""
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Age
                </label>

                <input
                  value={
                    claim.patient_age ?? ""
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Relationship to Claimant
                </label>

                <input
                  value={
                    claim.relationship || ""
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Medical Officer
                </label>

                <input
                  value={
                    claim.medical_officer || ""
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Referral Date
                </label>

                <input
                  value={
                    claim.referral_date || ""
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Referral Hospital / Clinic /
                  Diagnostic Centre
                </label>

                <input
                  value={
                    claim.referral_hospital || ""
                  }
                  readOnly
                />
              </div>

            </div>

          </section>

          <section className="form-section">

            <h2>
              3. Details of Medical Expenses
            </h2>

            <h3>
              Consultation
            </h3>

            {consultationExpenses.length === 0 ? (

              <p>
                No consultation expenses.
              </p>

            ) : (

              <div className="expense-table">

                <div className="table-header">

                  <div>
                    Consultant
                  </div>

                  <div>
                    Speciality
                  </div>

                  <div>
                    Date
                  </div>

                  <div>
                    Amount
                  </div>

                  <div>
                    -
                  </div>

                </div>

                {consultationExpenses.map(
                  (expense) => (

                    <div
                      className="table-row"
                      key={expense.id}
                    >

                      <input
                        value={
                          expense.consultant || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          expense.specialty || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          expense.expense_date || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          `₹${expense.amount}`
                        }
                        readOnly
                      />

                      <div />

                    </div>

                  )
                )}

              </div>

            )}

            <h3>
              Radiology
            </h3>

            {radiologyExpenses.length === 0 ? (

              <p>
                No radiology expenses.
              </p>

            ) : (

              <div className="expense-table">

                <div className="table-header">

                  <div>
                    Type
                  </div>

                  <div>
                    Region
                  </div>

                  <div>
                    Date
                  </div>

                  <div>
                    Amount
                  </div>

                  <div>
                    -
                  </div>

                </div>

                {radiologyExpenses.map(
                  (expense) => (

                    <div
                      className="table-row"
                      key={expense.id}
                    >

                      <input
                        value={
                          expense.item_type || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          expense.region || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          expense.expense_date || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          `₹${expense.amount}`
                        }
                        readOnly
                      />

                      <div />

                    </div>

                  )
                )}

              </div>

            )}

            <h3>
              Scopy / Procedure
            </h3>

            {scopyExpenses.length === 0 ? (

              <p>
                No scopy / procedure expenses.
              </p>

            ) : (

              <div className="expense-table">

                <div className="table-header">

                  <div>
                    Procedure
                  </div>

                  <div>
                    Region
                  </div>

                  <div>
                    Date
                  </div>

                  <div>
                    Amount
                  </div>

                  <div>
                    -
                  </div>

                </div>

                {scopyExpenses.map(
                  (expense) => (

                    <div
                      className="table-row"
                      key={expense.id}
                    >

                      <input
                        value={
                          expense.item_type || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          expense.region || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          expense.expense_date || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          `₹${expense.amount}`
                        }
                        readOnly
                      />

                      <div />

                    </div>

                  )
                )}

              </div>

            )}

            <h3>
              Minor Procedures
            </h3>

            {minorExpenses.length === 0 ? (

              <p>
                No minor procedure expenses.
              </p>

            ) : (

              <div className="expense-table">

                <div className="table-header">

                  <div>
                    Procedure
                  </div>

                  <div>
                    Region
                  </div>

                  <div>
                    Date
                  </div>

                  <div>
                    Amount
                  </div>

                  <div>
                    -
                  </div>

                </div>

                {minorExpenses.map(
                  (expense) => (

                    <div
                      className="table-row"
                      key={expense.id}
                    >

                      <input
                        value={
                          expense.item_type || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          expense.region || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          expense.expense_date || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          `₹${expense.amount}`
                        }
                        readOnly
                      />

                      <div />

                    </div>

                  )
                )}

              </div>

            )}

            <h3>
              Appliances
            </h3>

            {applianceExpenses.length === 0 ? (

              <p>
                No appliance expenses.
              </p>

            ) : (

              <div className="expense-table">

                <div className="table-header">

                  <div>
                    Appliance
                  </div>

                  <div>
                    Region
                  </div>

                  <div>
                    Date
                  </div>

                  <div>
                    Amount
                  </div>

                  <div>
                    -
                  </div>

                </div>

                {applianceExpenses.map(
                  (expense) => (

                    <div
                      className="table-row"
                      key={expense.id}
                    >

                      <input
                        value={
                          expense.item_type || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          expense.region || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          expense.expense_date || ""
                        }
                        readOnly
                      />

                      <input
                        value={
                          `₹${expense.amount}`
                        }
                        readOnly
                      />

                      <div />

                    </div>

                  )
                )}

              </div>

            )}

          </section>

          <section className="form-section">

            <h2>
              4. Claim Summary
            </h2>

            <div className="form-grid">

              <div>

                <label>
                  Total Amount Claimed (Rs.)
                </label>

                <input
                  value={
                    `₹${claim.total_amount}`
                  }
                  readOnly
                />

              </div>

              <div>

                <label>
                  Total Number of Enclosures
                </label>

                <input
                  value={
                    claim.total_enclosures ?? ""
                  }
                  readOnly
                />

              </div>

            </div>

          </section>

          <section className="form-section">

            <h2>
              Supporting Documents
            </h2>

            {claim.documents && claim.documents.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", marginTop: "12px" }}>
                {claim.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color, #e2e8f0)",
                      background: "var(--card-bg, #f8fafc)",
                    }}
                  >
                    <div style={{ overflow: "hidden", paddingRight: "10px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#2563eb",
                          textTransform: "uppercase",
                          marginBottom: "2px",
                        }}
                      >
                        {doc.document_type ? doc.document_type.replace(/_/g, " ") : "Document"}
                      </span>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: "500",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {doc.original_filename}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="back-button"
                      onClick={() => openDocumentInNewTab(doc.id)}
                      style={{ padding: "6px 12px", fontSize: "12px", flexShrink: 0 }}
                    >
                      👁️ View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No supporting documents uploaded for this claim.</p>
            )}

          </section>

          <section className="form-section declaration-section">

            <h2>
              5. Declaration
            </h2>

            <p>
              I hereby declare that the information
              provided in this medical claim form is
              true and correct to the best of my
              knowledge. I understand that any
              incorrect information may result in
              rejection of the claim.
            </p>

            <label className="checkbox-label">

              <input
                type="checkbox"
                checked={
                  Boolean(
                    claim.declaration
                  )
                }
                readOnly
              />

              I accept the declaration

            </label>

            <div className="form-grid">

              <div>

                <label>
                  Date
                </label>

                <input
                  value={
                    claim.declaration_date || ""
                  }
                  readOnly
                />

              </div>

              <div>

                <label>
                  CAPTCHA Verification
                </label>

                <input
                  value={
                    claim.signature || ""
                  }
                  readOnly
                />

              </div>

            </div>

          </section>

          <div className="submit-area">

            <button
              type="button"
              className="back-button"
              onClick={() =>
                handleEditClaim(claim)
              }
            >
              Edit Form
            </button>

            <button
              type="button"
              className="logout-button"
              onClick={() =>
                handleDeleteClaim(claim.id)
              }
              style={{ marginLeft: "10px" }}
            >
              Delete Claim
            </button>

            <button
              type="button"
              className="back-button"
              onClick={() =>
                setPage("my-claims")
              }
              style={{ marginLeft: "10px" }}
            >
              Back to My Claims
            </button>

          </div>

        </main>

      </div>
    );
  }

  if (page === "my-claims") {

    return (
      <div className="dashboard-page">

        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("My Medical Claims", "Submitted medical reimbursement claims")}

          <div className="header-actions">
            <button
              className="back-button"
              onClick={() => setPage(getRoleDashboardPage())}
            >
              Back to Dashboard
            </button>
          </div>

        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>

          {claims.length === 0 ? (

            <div className="welcome-card">

              <h2>
                No Claims Found
              </h2>

              <p>
                You have not submitted
                any medical claims yet.
              </p>

            </div>

          ) : (

            <div className="welcome-card">

              <h2>My Medical Claims</h2>

              <div
                style={{
                  width: "100%",
                  maxWidth: "1200px",
                  margin: "20px auto 0",
                  overflowX: "auto",
                  boxSizing: "border-box",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "850px",
                    background: "var(--card-bg, #ffffff)",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          padding: "12px",
                          border: "1px solid var(--border-color, #ddd)",
                          textAlign: "left",
                        }}
                      >
                        Claim ID
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          border: "1px solid var(--border-color, #ddd)",
                          textAlign: "left",
                        }}
                      >
                        Email ID
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          border: "1px solid var(--border-color, #ddd)",
                          textAlign: "left",
                        }}
                      >
                        Name
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          border: "1px solid var(--border-color, #ddd)",
                          textAlign: "left",
                        }}
                      >
                        Status
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          border: "1px solid var(--border-color, #ddd)",
                          textAlign: "center",
                        }}
                      >
                        View
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {claims.map((claim) => (
                      <tr key={claim.id}>

                        <td
                          style={{
                            padding: "12px",
                            border: "1px solid var(--border-color, #ddd)",
                          }}
                        >
                          #{claim.id}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            border: "1px solid var(--border-color, #ddd)",
                          }}
                        >
                          {claim.email || "-"}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            border: "1px solid var(--border-color, #ddd)",
                          }}
                        >
                          {claim.claimant_name || claim.username || "-"}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            border: "1px solid var(--border-color, #ddd)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              fontWeight: "bold",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              background:
                                ["Approved", "AUTHORIZED"].includes(claim.status)
                                  ? "#d4edda"
                                  : ["Rejected", "REJECTED"].includes(claim.status)
                                    ? "#f8d7da"
                                    : "#fff3cd",
                              color:
                                ["Approved", "AUTHORIZED"].includes(claim.status)
                                  ? "#155724"
                                  : ["Rejected", "REJECTED"].includes(claim.status)
                                    ? "#721c24"
                                    : "#856404",
                            }}
                          >
                            {claim.status || "Pending"}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            border: "1px solid var(--border-color, #ddd)",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              className="back-button"
                              onClick={() => handleViewFullClaim(claim)}
                            >
                              View Claim
                            </button>

                            <button
                              type="button"
                              className="back-button"
                              onClick={() => handleEditClaim(claim)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="logout-button"
                              onClick={() => handleDeleteClaim(claim.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          )}

        </main>

      </div>
    );
  }

  if (page === "chief-dashboard") {

    const pendingChiefClaims =
      chiefClaims.filter(
        (claim) => ["DIRECT_TO_CMO", "MO_APPROVED", "Pending", "PENDING"].includes(claim.status)
      );

    const approvedChiefClaims =
      chiefClaims.filter(
        (claim) => ["AUTHORIZED", "Approved"].includes(claim.status)
      );

    const rejectedChiefClaims =
      chiefClaims.filter(
        (claim) =>
          claim.status === "Rejected"
      );

    return (
      <div className="dashboard-page">

        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("Chief Medical Officer Dashboard", "Review medical claims and monitor Medical Officers")}

          <div className="header-actions">
            <button
              type="button"
              className="profile-header-button"
              onClick={() => openProfile("chief-dashboard")}
            >
              Profile
            </button>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>

          <div className="dashboard-grid">

            <div className="dashboard-card">
              <h3>Medical Officers</h3>
              <h2>{chiefOfficers.length}</h2>
              <p>Active Medical Officers</p>
            </div>

            <div className="dashboard-card">
              <h3>Pending Claims</h3>
              2{pendingChiefClaims.length}
              <p>Claims waiting for review</p>
            </div>

            <div className="dashboard-card">
              <h3>Approved</h3>
              <h2>{approvedChiefClaims.length}</h2>
              <p>Approved claims</p>
            </div>

            <div className="dashboard-card">
              <h3>Forwarded</h3>
              <h2>{chiefClaims.filter((claim) => ["MO_APPROVED", "DIRECT_TO_CMO"].includes(claim.status)).length}</h2>
              <p>Claims forwarded to CMO</p>
            </div>

            <div className="dashboard-card">
              <h3>Rejected</h3>
              <h2>{rejectedChiefClaims.length}</h2>
              <p>Rejected claims</p>
            </div>

          </div>

          <div
            className="welcome-card"
            style={{ marginTop: "20px" }}
          >
            <h2>Personal Medical Reimbursement Claims</h2>
            <p>Create and submit your own medical claims or view your personal claims.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="back-button"
                onClick={async () => {
                  const loaded = await loadAvailableMedicalOfficers();
                  if (loaded) {
                    setPage("medical-form");
                  }
                }}
              >
                Create Claim
              </button>
              <button
                type="button"
                className="back-button"
                onClick={handleViewClaims}
              >
                My Personal Claims
              </button>
            </div>
          </div>

          <div
            className="welcome-card"
            style={{ marginTop: "20px" }}
          >
            <h2>Medical Officers</h2>
            <p>
              Open complete Medical Officer information on a separate page.
            </p>

            <button
              type="button"
              className="back-button"
              onClick={() => setPage("chief-officers")}
            >
              View All Medical Officers
            </button>
          </div>

          <div
            className="welcome-card"
            style={{ marginTop: "20px" }}
          >
            <h2>Medical Claims</h2>
            <p>
              Open complete medical claim information on a separate page.
            </p>

            <button
              type="button"
              className="back-button"
              onClick={() => setPage("chief-claims")}
            >
              View All Medical Claims
            </button>
          </div>


          <div className="welcome-card" style={{ marginTop: "20px" }}>
            <h2>Medical Claims List</h2>
            <p>Claim ID, Email ID, Name, Status and View</p>
            {chiefClaims.length === 0 ? (
              <p>No medical claims found.</p>
            ) : (
              renderClaimTable(chiefClaims, (claim) => {
                setChiefSelectedClaim(claim);
                setChiefRemarks(claim.officer_remarks || "");
                setPage("chief-review");
              }, "View Claim")
            )}
          </div>

        </main>

      </div>
    );
  }

  if (page === "chief-officers") {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("Medical Officers", "Complete Medical Officer information")}

          <div className="header-actions">
            <button
              type="button"
              className="profile-header-button"
              onClick={() => openProfile("chief-dashboard")}
            >
              Profile
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>
          <div className="welcome-card">
            <button
              type="button"
              className="back-button"
              onClick={() => setPage("chief-dashboard")}
            >
              Back to CMO Dashboard
            </button>

            <h2 style={{ marginTop: "20px" }}>All Medical Officers</h2>

            {chiefOfficers.length === 0 ? (
              <p>No Medical Officers found.</p>
            ) : (
              <div style={{ overflowX: "auto", marginTop: "20px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "800px",
                    background: "var(--card-bg, #ffffff)",
                  }}
                >
                  <thead>
                    <tr>
                      {["User ID", "Photo", "Name", "Email", "Role", "View"].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            border: "1px solid var(--border-color, #ddd)",
                            padding: "12px",
                            textAlign: "left",
                            fontWeight: "700",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chiefOfficers.map((officer) => {
                      const officerPhoto =
                        officer.photo ||
                        officer.profile_photo ||
                        localStorage.getItem(`profile_photo_${officer.username}`) ||
                        "";

                      return (
                        <tr key={officer.id}>
                          <td
                            style={{
                              border: "1px solid var(--border-color, #ddd)",
                              padding: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {officer.id ?? "-"}
                          </td>
                          <td
                            style={{
                              border: "1px solid var(--border-color, #ddd)",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            {officerPhoto ? (
                              <img
                                src={officerPhoto}
                                alt={`${officer.username || "Medical Officer"} profile`}
                                style={{
                                  width: "52px",
                                  height: "52px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  display: "inline-block",
                                  border: "2px solid var(--border-color, #ddd)",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "52px",
                                  height: "52px",
                                  borderRadius: "50%",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "700",
                                  background: "var(--input-bg, #f1f5f9)",
                                  border: "2px solid var(--border-color, #ddd)",
                                }}
                              >
                                {(officer.username || "MO").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td
                            style={{
                              border: "1px solid var(--border-color, #ddd)",
                              padding: "12px",
                            }}
                          >
                            {officer.username || "-"}
                          </td>
                          <td
                            style={{
                              border: "1px solid var(--border-color, #ddd)",
                              padding: "12px",
                            }}
                          >
                            {officer.email || "-"}
                          </td>
                          <td
                            style={{
                              border: "1px solid var(--border-color, #ddd)",
                              padding: "12px",
                            }}
                          >
                            {officer.role || "MEDICAL_OFFICER"}
                          </td>
                          <td
                            style={{
                              border: "1px solid var(--border-color, #ddd)",
                              padding: "12px",
                            }}
                          >
                            <button
                              type="button"
                              className="back-button"
                              onClick={() => {
                                setChiefSelectedOfficer(officer);
                                setPage("chief-officer-detail");
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (page === "chief-officer-detail" && chiefSelectedOfficer) {
    const officer = chiefSelectedOfficer;

    return (
      <div className="dashboard-page">
        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("Medical Officer Details", "Complete Medical Officer information")}

          <button
            type="button"
            className="back-button"
            onClick={() => setPage("chief-officers")}
          >
            Back
          </button>
        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>
          <div className="welcome-card">
            <h2>{officer.username}</h2>

            <div className="form-grid">
              <div>
                <label>User ID</label>
                <input value={officer.id ?? ""} readOnly />
              </div>
              <div>
                <label>Username</label>
                <input value={officer.username || ""} readOnly />
              </div>
              <div>
                <label>Email</label>
                <input value={officer.email || ""} readOnly />
              </div>
              <div>
                <label>Role</label>
                <input value="Medical Officer" readOnly />
              </div>
              <div>
                <label>LDAP DN</label>
                <input value={officer.ldap_dn || ""} readOnly />
              </div>
              <div>
                <label>Created At</label>
                <input value={officer.created_at || ""} readOnly />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (page === "chief-claims") {
    const filteredChiefClaims = chiefClaims.filter((claim) => {
      const status = claim.status || "Pending";

      if (chiefClaimFilter === "APPROVED") {
        return ["Approved", "AUTHORIZED"].includes(status);
      }
      if (chiefClaimFilter === "FORWARDED") {
        return ["MO_APPROVED", "DIRECT_TO_CMO"].includes(status);
      }
      if (chiefClaimFilter === "PENDING") {
        return ["Pending", "PENDING"].includes(status);
      }
      if (chiefClaimFilter === "REJECTED") {
        return ["Rejected", "REJECTED"].includes(status);
      }
      return true;
    });

    return (
      <div className="dashboard-page">
        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("All Medical Claims", "Complete medical claim information")}
          <div className="header-actions">
            <button
              type="button"
              className="profile-header-button"
              onClick={() => openProfile("chief-dashboard")}
            >
              Profile
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>
          <div className="welcome-card">
            <button
              type="button"
              className="back-button"
              onClick={() => {
                setChiefClaimFilter("ALL");
                setPage("chief-dashboard");
              }}
            >
              Back to CMO Dashboard
            </button>

            <h2 style={{ marginTop: "20px" }}>Medical Claims</h2>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              <button type="button" className="back-button" onClick={() => setChiefClaimFilter("APPROVED")}>
                Approved
              </button>
              <button type="button" className="back-button" onClick={() => setChiefClaimFilter("FORWARDED")}>
                Forwarded
              </button>
              <button type="button" className="back-button" onClick={() => setChiefClaimFilter("PENDING")}>
                Pending
              </button>
              <button type="button" className="back-button" onClick={() => setChiefClaimFilter("REJECTED")}>
                Rejected
              </button>
            </div>

            {filteredChiefClaims.length === 0 ? (
              <p>
                No{" "}
                {chiefClaimFilter === "ALL"
                  ? "medical claims"
                  : chiefClaimFilter.toLowerCase() + " claims"}{" "}
                found.
              </p>
            ) : (
              renderClaimTable(
                filteredChiefClaims,
                (claim) => {
                  setChiefSelectedClaim(claim);
                  setChiefRemarks(claim.officer_remarks || "");
                  setPage("chief-review");
                },
                "View Claim"
              )
            )}
          </div>
        </main>
      </div>
    );
  }


  if (page === "officer-dashboard") {

    const pendingClaims = officerClaims.filter(
      (claim) => ["Pending", "PENDING"].includes(claim.status)
    );

    const approvedClaims = officerClaims.filter(
      (claim) => ["Approved", "AUTHORIZED"].includes(claim.status)
    );

    const rejectedClaims = officerClaims.filter(
      (claim) => ["Rejected", "REJECTED"].includes(claim.status)
    );

    return (
      <div className="dashboard-page">

        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("Medical Officer Dashboard", "Review and manage submitted medical claims")}

          <div className="header-actions">
            <button
              type="button"
              className="profile-header-button"
              onClick={() => openProfile("officer-dashboard")}
            >
              Profile
            </button>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>

          <div className="welcome-card">
            <h2>Personal Medical Reimbursement Claims</h2>
            <p>Create and submit your own medical claims or view your personal claims.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="back-button"
                onClick={async () => {
                  const loaded = await loadAvailableMedicalOfficers();
                  if (loaded) {
                    setPage("medical-form");
                  }
                }}
              >
                Create Claim
              </button>
              <button
                type="button"
                className="back-button"
                onClick={handleViewClaims}
              >
                My Personal Claims
              </button>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>All Claims</h3>
              <h2>{officerClaims.length}</h2>
              <p>Total submitted claims</p>
            </div>

            <div className="dashboard-card">
              <h3>Pending</h3>
              <h2>{pendingClaims.length}</h2>
              <p>Claims waiting for review</p>
            </div>

            <div className="dashboard-card">
              <h3>Approved</h3>
              <h2>{approvedClaims.length}</h2>
              <p>Approved claims</p>
            </div>

            <div className="dashboard-card">
              <h3>Rejected</h3>
              <h2>{rejectedClaims.length}</h2>
              <p>Rejected claims</p>
            </div>
          </div>

          <div className="welcome-card" style={{ marginTop: "20px" }}>
            <h2>Medical Claim Management</h2>
            <p>Select an option to open the claims in a separate page.</p>

            <div className="form-grid" style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="back-button"
                onClick={() => setPage("officer-all-claims")}
              >
                View All Claims
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => setPage("officer-approved-claims")}
              >
                Approved Claims
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => setPage("officer-pending-claims")}
              >
                Pending Claims
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => setPage("officer-rejected-claims")}
              >
                Rejected Claims
              </button>
            </div>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => setPage("dashboard")}
            style={{ marginTop: "20px" }}
          >
            Back to Dashboard
          </button>

        </main>
      </div>
    );
  }

  const renderOfficerClaimPage = (title, description, claimList) => {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft(title, description)}
          <div className="header-actions">
            <button
              type="button"
              className="profile-header-button"
              onClick={() => openProfile("officer-dashboard")}
            >
              Profile
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>
          <div className="welcome-card">
            <button
              type="button"
              className="back-button"
              onClick={() => setPage("officer-dashboard")}
            >
              Back to Medical Officer Dashboard
            </button>

            <h2 style={{ marginTop: "20px" }}>{title}</h2>

            {claimList.length === 0 ? (
              <p>No claims found in this category.</p>
            ) : (
              renderClaimTable(
                claimList,
                (claim) => handleViewOfficerClaim(claim.id),
                "View Claim"
              )
            )}
          </div>

          <div className="welcome-card" style={{ marginTop: "20px" }}>
            <h2>Medical Claims List</h2>
            <p>Claim ID, Email ID, Name, Status and View</p>
            {officerClaims.length === 0 ? (
              <p>No medical claims found.</p>
            ) : (
              renderClaimTable(officerClaims, (claim) => handleViewOfficerClaim(claim.id), "View Claim")
            )}
          </div>

        </main>
      </div>
    );
  };

  if (page === "officer-all-claims") {
    return renderOfficerClaimPage(
      "All Medical Claims",
      "View all medical claims submitted to the Medical Officer",
      officerClaims
    );
  }

  if (page === "officer-approved-claims") {
    const approvedClaims = officerClaims.filter(
      (claim) => ["MO_APPROVED", "AUTHORIZED", "Approved"].includes(claim.status)
    );

    return renderOfficerClaimPage(
      "Approved Medical Claims",
      "View all approved medical claims",
      approvedClaims
    );
  }

  if (page === "officer-pending-claims") {
    const pendingClaims = officerClaims.filter(
      (claim) => ["Pending", "PENDING"].includes(claim.status)
    );

    return renderOfficerClaimPage(
      "Pending Medical Claims",
      "View all medical claims waiting for review",
      pendingClaims
    );
  }

  if (page === "officer-rejected-claims") {
    const rejectedClaims = officerClaims.filter(
      (claim) => ["Rejected", "REJECTED"].includes(claim.status)
    );

    return renderOfficerClaimPage(
      "Rejected Medical Claims",
      "View all rejected medical claims",
      rejectedClaims
    );
  }

  if (page === "dashboard") {

    return (
      <div className="dashboard-page">

        <header className="dashboard-header" style={headerStyle}>
          {renderHeaderLeft("IITM Medical Form", "Student Medical Claim Portal")}

          <div className="header-actions">
            <button
              type="button"
              className="profile-header-button"
              onClick={() => openProfile("dashboard")}
            >
              Profile
            </button>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

        </header>

        {showNavigation && renderNavigationBar()}

        <main className="dashboard-content" style={mainContentStyle}>

          <div className="welcome-card">

            <h2>
              Welcome
            </h2>

            <p>
              Submit and manage your
              medical reimbursement claims.
            </p>

          </div>

          <div
            className="dashboard-grid"
            style={{
              width: "100%",
              maxWidth: "1200px",
              margin: "24px auto 0",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "24px",
              alignItems: "stretch",
              boxSizing: "border-box",
            }}
          >

            <div
              className="dashboard-card"
              style={{
                width: "100%",
                minHeight: "220px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >

              <div>
                <h3>
                  Medical Claim
                </h3>

              <p>
                Submit a new medical
                reimbursement claim.
              </p>

              </div>

              <button
                onClick={async () => {
                  const loaded = await loadAvailableMedicalOfficers();
                  if (loaded) {
                    setPage("medical-form");
                  }
                }}
                style={{ width: "100%", marginTop: "20px" }}
              >
                Create Claim
              </button>

            </div>

            <div
              className="dashboard-card"
              style={{
                width: "100%",
                minHeight: "220px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >

              <div>
                <h3>
                  My Claims
                </h3>

              <p>
                View your submitted
                medical claims.
              </p>

              </div>

              <button
                onClick={
                  handleViewClaims
                }
                style={{ width: "100%", marginTop: "20px" }}
              >
                View Claims
              </button>

            </div>

            <div
              className="dashboard-card"
              style={{
                width: "100%",
                minHeight: "220px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >

              <div>
                <h3>
                  Profile
                </h3>

              <p>
                View your account
                information.
              </p>

              </div>

              <button
                type="button"
                onClick={() => openProfile("dashboard")}
                style={{ width: "100%", marginTop: "20px" }}
              >
                View Profile
              </button>

            </div>

          </div>

        </main>

      </div>
    );
  }

  return (

    <div className="form-page">

      <header className="form-header" style={headerStyle}>
        {renderHeaderLeft(
          "IITM Medical Claim Form",
          page === "edit-form" ? `Edit Medical Claim #${editingClaimId}` : "Medical Reimbursement"
        )}

        <button
          type="button"
          className="back-button"
          onClick={() =>
            setPage(
              page === "edit-form"
                ? "my-claims"
                : getRoleDashboardPage()
            )
          }
        >
          Back
        </button>

      </header>

      {showNavigation && renderNavigationBar()}

      <main className="medical-form-container" style={mainContentStyle}>

        <style>{`
          /* Create Claim layout alignment - visual/layout only */
          .medical-form-container .claim-form-layout {
            width: 100%;
            max-width: 1180px;
            margin: 0 auto;
            box-sizing: border-box;
          }

          .medical-form-container .claim-form-layout .form-section {
            width: 100%;
            box-sizing: border-box;
            overflow: hidden;
          }

          .medical-form-container .claim-form-layout .form-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 20px 24px !important;
            width: 100%;
            align-items: start;
            box-sizing: border-box;
          }

          .medical-form-container .claim-form-layout .form-grid > div {
            min-width: 0;
            width: 100%;
            box-sizing: border-box;
          }

          .medical-form-container .claim-form-layout label {
            display: block;
            width: 100%;
            margin-bottom: 8px;
            box-sizing: border-box;
          }

          .medical-form-container .claim-form-layout input:not([type="checkbox"]),
          .medical-form-container .claim-form-layout select,
          .medical-form-container .claim-form-layout textarea {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }

          .medical-form-container .claim-form-layout .expense-table {
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            box-sizing: border-box;
            margin-top: 12px;
          }

          .medical-form-container .claim-form-layout .expense-table .table-header,
          .medical-form-container .claim-form-layout .expense-table .table-row {
            display: grid !important;
            grid-template-columns: minmax(180px, 2fr) minmax(150px, 1.7fr) minmax(135px, 1.2fr) minmax(120px, 1fr) 64px !important;
            gap: 12px;
            width: 100%;
            min-width: 700px;
            align-items: center;
            box-sizing: border-box;
          }

          .medical-form-container .claim-form-layout .expense-table .table-header > *,
          .medical-form-container .claim-form-layout .expense-table .table-row > * {
            min-width: 0;
            width: 100%;
            box-sizing: border-box;
          }

          .medical-form-container .claim-form-layout .expense-table .table-row input,
          .medical-form-container .claim-form-layout .expense-table .table-row select {
            margin: 0;
          }

          .medical-form-container .claim-form-layout .expense-table .remove-button {
            width: 100%;
            min-width: 44px;
            height: 42px;
            margin: 0;
            box-sizing: border-box;
          }

          .medical-form-container .claim-form-layout .add-button {
            margin-top: 12px;
            margin-bottom: 24px;
          }

          .medical-form-container .claim-form-layout .checkbox-label {
            display: flex !important;
            align-items: center;
            gap: 10px;
            width: fit-content !important;
            margin: 14px 0 20px;
          }

          .medical-form-container .claim-form-layout .checkbox-label input[type="checkbox"] {
            width: 18px !important;
            height: 18px !important;
            min-width: 18px;
            margin: 0;
          }

          .medical-form-container .claim-form-layout .declaration-section .form-grid {
            align-items: start;
          }

          .medical-form-container .claim-form-layout .declaration-section .form-grid > div {
            display: flex;
            flex-direction: column;
            min-width: 0;
          }

          .medical-form-container .claim-form-layout .declaration-section .form-grid > div > input,
          .medical-form-container .claim-form-layout .declaration-section .form-grid > div > div {
            width: 100%;
            box-sizing: border-box;
          }

          @media (max-width: 800px) {
            .medical-form-container .claim-form-layout .form-grid {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }

            .medical-form-container .claim-form-layout .form-section {
              padding-left: 16px;
              padding-right: 16px;
            }

            .medical-form-container .claim-form-layout .expense-table {
              overflow-x: auto;
            }
          }
        `}</style>

        <form
          className="claim-form-layout"
          onSubmit={
            page === "edit-form"
              ? handleUpdateClaim
              : handleSubmitForm
          }
        >

          <section className="form-section">

            <h2>
              1. Information of the Claimant
            </h2>

            <div className="form-grid">

              <div>

                <label>
                  Claimant Name
                </label>

                <input
                  type="text"
                  value={
                    formData.claimantName
                  }
                  onChange={(e) =>
                    updateFormData(
                      "claimantName",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div>

                <label>
                  ID No.
                </label>

                <input
                  type="text"
                  value={
                    formData.idNo
                  }
                  onChange={(e) =>
                    updateFormData(
                      "idNo",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div>

                <label>
                  Designation
                </label>

                <input
                  type="text"
                  value={
                    formData.designation
                  }
                  onChange={(e) =>
                    updateFormData(
                      "designation",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div>

                <label>
                  Department
                </label>

                <input
                  type="text"
                  value={
                    formData.department
                  }
                  onChange={(e) =>
                    updateFormData(
                      "department",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div>

                <label>
                  Mobile No.
                </label>

                <input
                  type="tel"
                  value={
                    formData.mobileNo
                  }
                  onChange={(e) =>
                    updateFormData(
                      "mobileNo",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

            </div>

          </section>

          <section className="form-section">

            <h2>
              2. Information of the Patient
            </h2>

            <div className="form-grid">

              <div>

                <label>
                  Patient Name
                </label>

                <input
                  type="text"
                  value={
                    formData.patientName
                  }
                  onChange={(e) =>
                    updateFormData(
                      "patientName",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div>

                <label>
                  Age
                </label>

                <input
                  type="number"
                  value={
                    formData.patientAge
                  }
                  onChange={(e) =>
                    updateFormData(
                      "patientAge",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div>

                <label>
                  Relationship to Claimant
                </label>

                <input
                  type="text"
                  value={
                    formData.relationship
                  }
                  onChange={(e) =>
                    updateFormData(
                      "relationship",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div>

                <label>
                  Medical Officer
                </label>

                <select
                  value={
                    formData.referringMO
                  }
                  onChange={(e) =>
                    updateFormData(
                      "referringMO",
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select Medical Officer
                  </option>

                  {studentMedicalOfficers.map((officer) => (
                    <option
                      key={officer.id}
                      value={officer.username}
                    >
                      {officer.username} - {officer.email}
                    </option>
                  ))}

                </select>

              </div>

              <div>

                <label>
                  Referral Date
                </label>

                <input
                  type="date"
                  value={
                    formData.referralDate
                  }
                  onChange={(e) =>
                    updateFormData(
                      "referralDate",
                      e.target.value
                    )
                  }
                />

              </div>

              <div>

                <label>
                  Referral Hospital / Clinic /
                  Diagnostic Centre
                </label>

                <input
                  type="text"
                  value={
                    formData.referralHospital
                  }
                  onChange={(e) =>
                    updateFormData(
                      "referralHospital",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

          </section>

          <section className="form-section">

            <h2>
              3. Details of Medical Expenses
            </h2>

            <h3>
              Consultation
            </h3>

            <div className="expense-table">

              <div className="table-header">

                <div>
                  Name of Consultant
                </div>

                <div>
                  Speciality
                </div>

                <div>
                  Date
                </div>

                <div>
                  Amount
                </div>

                <div>
                  Action
                </div>

              </div>

              {consultations.map(
                (item, index) => (

                  <div
                    className="table-row"
                    key={index}
                  >

                    <input
                      type="text"
                      value={
                        item.consultant
                      }
                      onChange={(e) =>
                        updateConsultation(
                          index,
                          "consultant",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="text"
                      value={
                        item.specialty
                      }
                      onChange={(e) =>
                        updateConsultation(
                          index,
                          "specialty",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="date"
                      value={
                        item.date
                      }
                      onChange={(e) =>
                        updateConsultation(
                          index,
                          "date",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      value={
                        item.amount
                      }
                      onChange={(e) =>
                        updateConsultation(
                          index,
                          "amount",
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() =>
                        removeConsultation(
                          index
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

            <button
              type="button"
              className="add-button"
              onClick={
                addConsultation
              }
            >
              + Add Consultation
            </button>

            <h3>
              Radiology
            </h3>

            <div className="expense-table">

              <div className="table-header">

                <div>
                  Type
                </div>

                <div>
                  Region
                </div>

                <div>
                  Date
                </div>

                <div>
                  Amount
                </div>

                <div>
                  Action
                </div>

              </div>

              {radiology.map(
                (item, index) => (

                  <div
                    className="table-row"
                    key={index}
                  >

                    <select
                      value={
                        item.type
                      }
                      onChange={(e) =>
                        updateRadiology(
                          index,
                          "type",
                          e.target.value
                        )
                      }
                    >

                      <option>
                        Ultrasonography (U/S)
                      </option>

                      <option>
                        Mammography
                      </option>

                      <option>
                        MRI
                      </option>

                      <option>
                        CT
                      </option>

                      <option>
                        Doppler
                      </option>

                      <option>
                        Echo
                      </option>

                      <option>
                        PET Scan
                      </option>

                    </select>

                    <input
                      type="text"
                      value={
                        item.region
                      }
                      onChange={(e) =>
                        updateRadiology(
                          index,
                          "region",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="date"
                      value={
                        item.date
                      }
                      onChange={(e) =>
                        updateRadiology(
                          index,
                          "date",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      value={
                        item.amount
                      }
                      onChange={(e) =>
                        updateRadiology(
                          index,
                          "amount",
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() =>
                        removeRadiology(
                          index
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

            <button
              type="button"
              className="add-button"
              onClick={
                addRadiology
              }
            >
              + Add Radiology
            </button>

            <h3>
              Scopy / Procedure
            </h3>

            <div className="expense-table">

              <div className="table-header">

                <div>
                  Procedure
                </div>

                <div>
                  Region
                </div>

                <div>
                  Date
                </div>

                <div>
                  Amount
                </div>

                <div>
                  Action
                </div>

              </div>

              {scopy.map(
                (item, index) => (

                  <div
                    className="table-row"
                    key={index}
                  >

                    <select
                      value={
                        item.type
                      }
                      onChange={(e) =>
                        updateScopy(
                          index,
                          "type",
                          e.target.value
                        )
                      }
                    >

                      <option>
                        Endoscopy
                      </option>

                      <option>
                        Colonoscopy
                      </option>

                      <option>
                        Sigmoidoscopy
                      </option>

                      <option>
                        Colposcopy
                      </option>

                      <option>
                        Others
                      </option>

                    </select>

                    <input
                      type="text"
                      value={
                        item.region
                      }
                      onChange={(e) =>
                        updateScopy(
                          index,
                          "region",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="date"
                      value={
                        item.date
                      }
                      onChange={(e) =>
                        updateScopy(
                          index,
                          "date",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      value={
                        item.amount
                      }
                      onChange={(e) =>
                        updateScopy(
                          index,
                          "amount",
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() =>
                        removeScopy(
                          index
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

            <button
              type="button"
              className="add-button"
              onClick={
                addScopy
              }
            >
              + Add Scopy / Procedure
            </button>

            <h3>
              Minor Procedures
            </h3>

            <div className="expense-table">

              <div className="table-header">

                <div>
                  Procedure
                </div>

                <div>
                  Region
                </div>

                <div>
                  Date
                </div>

                <div>
                  Amount
                </div>

                <div>
                  Action
                </div>

              </div>

              {minorProcedures.map(
                (item, index) => (

                  <div
                    className="table-row"
                    key={index}
                  >

                    <select
                      value={
                        item.type
                      }
                      onChange={(e) =>
                        updateMinorProcedure(
                          index,
                          "type",
                          e.target.value
                        )
                      }
                    >

                      <option>
                        Suturing
                      </option>

                      <option>
                        POP Application
                      </option>

                      <option>
                        Biopsy
                      </option>

                      <option>
                        Others
                      </option>

                      <option>
                        K. Wire fixation
                      </option>

                    </select>

                    <input
                      type="text"
                      value={
                        item.region
                      }
                      onChange={(e) =>
                        updateMinorProcedure(
                          index,
                          "region",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="date"
                      value={
                        item.date
                      }
                      onChange={(e) =>
                        updateMinorProcedure(
                          index,
                          "date",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      value={
                        item.amount
                      }
                      onChange={(e) =>
                        updateMinorProcedure(
                          index,
                          "amount",
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() =>
                        removeMinorProcedure(
                          index
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

            <button
              type="button"
              className="add-button"
              onClick={
                addMinorProcedure
              }
            >
              + Add Minor Procedure
            </button>

            <h3>
              Appliances
            </h3>

            <div className="expense-table">

              <div className="table-header">

                <div>
                  Appliance
                </div>

                <div>
                  Region
                </div>

                <div>
                  Date
                </div>

                <div>
                  Amount
                </div>

                <div>
                  Action
                </div>

              </div>

              {appliances.map(
                (item, index) => (

                  <div
                    className="table-row"
                    key={index}
                  >

                    <select
                      value={
                        item.type
                      }
                      onChange={(e) =>
                        updateAppliance(
                          index,
                          "type",
                          e.target.value
                        )
                      }
                    >

                      <option>
                        Hearing Aid
                      </option>

                      <option>
                        O2 Concentrator
                      </option>

                      <option>
                        Calipers
                      </option>

                      <option>
                        Others
                      </option>

                    </select>

                    <input
                      type="text"
                      value={
                        item.region
                      }
                      onChange={(e) =>
                        updateAppliance(
                          index,
                          "region",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="date"
                      value={
                        item.date
                      }
                      onChange={(e) =>
                        updateAppliance(
                          index,
                          "date",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      value={
                        item.amount
                      }
                      onChange={(e) =>
                        updateAppliance(
                          index,
                          "amount",
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() =>
                        removeAppliance(
                          index
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

            <button
              type="button"
              className="add-button"
              onClick={
                addAppliance
              }
            >
              + Add Appliance
            </button>

          </section>

          <section className="form-section">

            <h2>
              4. Claim Summary
            </h2>

            <div className="form-grid">

              <div>

                <label>
                  Total Amount Claimed (Rs.)
                </label>

                <input
                  type="number"
                  step="0.01"
                  value={
                    formData.totalAmount
                  }
                  onChange={(e) =>
                    updateFormData(
                      "totalAmount",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div>

                <label>
                  Total Number of Enclosures
                </label>

                <input
                  type="number"
                  value={
                    formData.totalEnclosures
                  }
                  onChange={(e) =>
                    updateFormData(
                      "totalEnclosures",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

            </div>

          </section>

          <section className="form-section">

            <h2>
              5. Supporting Documents
            </h2>

            <p style={{ marginBottom: "18px" }}>
              Attach supporting documents such as the original bill, receipt,
              medical reports and IITM hospital referral. PDF, DOCX, DOC, JPG, PNG and WEBP
              files up to 10 MB each are supported.
            </p>

            <div className="form-grid">
              {[
                { key: "original_bill", label: "Original Bill" },
                { key: "receipt", label: "Receipt" },
                { key: "reports", label: "Medical Reports" },
                { key: "iitm_hospital_referral", label: "IITM Hospital Referral" },
              ].map((document) => (
                <div key={document.key}>
                  <label>{document.label}</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(event) =>
                      handleDocumentChange(document.key, event)
                    }
                  />
                  <small style={{ display: "block", marginTop: "7px" }}>
                    {documentFiles[document.key].length > 0
                      ? documentFiles[document.key].map((file) => file.name).join(", ")
                      : "No file selected"}
                  </small>
                </div>
              ))}
            </div>

            <p style={{ marginTop: "14px", fontSize: "13px" }}>
              You can select more than one file for each document type.
            </p>

          </section>

          <section className="form-section declaration-section">

            <h2>
              5. Declaration
            </h2>

            <p>
              I hereby declare that the information
              provided in this medical claim form is
              true and correct to the best of my
              knowledge. I understand that any
              incorrect information may result in
              rejection of the claim.
            </p>

            <label className="checkbox-label">

              <input
                type="checkbox"
                checked={
                  formData.declaration
                }
                onChange={(e) =>
                  updateFormData(
                    "declaration",
                    e.target.checked
                  )
                }
                required
              />

              I accept the declaration

            </label>

            <div className="form-grid">

              <div>

                <label>
                  Date
                </label>

                <input
                  type="date"
                  value={
                    formData.declarationDate
                  }
                  onChange={(e) =>
                    updateFormData(
                      "declarationDate",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div>

                <label>
                  CAPTCHA Verification
                </label>

                <div
                  style={{
                    marginTop: "10px",
                    marginBottom: "12px",
                    minHeight: "82px",
                    padding: "14px 18px",
                    border: "2px solid #c7d2fe",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #eef2ff 0%, #e0f2fe 50%, #f5f3ff 100%)",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "inset 0 0 18px rgba(79,70,229,0.10)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage:
                        "repeating-linear-gradient(25deg, transparent 0px, transparent 9px, rgba(79,70,229,0.12) 10px, transparent 11px), repeating-linear-gradient(-25deg, transparent 0px, transparent 13px, rgba(14,116,144,0.10) 14px, transparent 15px)",
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    aria-label="CAPTCHA image"
                    style={{
                      position: "relative",
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "3px",
                      userSelect: "none",
                      filter: "blur(0.35px)",
                      transform: "rotate(-2deg)",
                    }}
                  >
                    {(captchaQuestion || "------").split("").map(
                      (char, index) => (
                        <span
                          key={`${char}-${index}`}
                          style={{
                            display: "inline-block",
                            fontSize: `${28 + (index % 3) * 3}px`,
                            fontWeight: 800,
                            fontFamily: "monospace",
                            letterSpacing: "1px",
                            color:
                              index % 2 === 0
                                ? "#1e3a8a"
                                : "#0f766e",
                            textShadow:
                              "1px 1px 0 rgba(255,255,255,0.9), -1px -1px 0 rgba(0,0,0,0.12)",
                            transform: `rotate(${index % 2 === 0 ? -8 + index : 6 - index}deg) translateY(${index % 2 === 0 ? -2 : 3}px)`,
                          }}
                        >
                          {char}
                        </span>
                      )
                    )}
                  </div>

                  <span
                    style={{
                      position: "absolute",
                      left: "8%",
                      right: "8%",
                      top: "50%",
                      height: "2px",
                      background: "rgba(239,68,68,0.38)",
                      transform: "rotate(-7deg)",
                      zIndex: 2,
                      pointerEvents: "none",
                    }}
                  />
                </div>

                <small
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary, #64748b)",
                  }}
                >
                  Type the characters shown in the blurred image.
                </small>

                <input
                  type="text"
                  value={captchaAnswer}
                  onChange={(e) =>
                    setCaptchaAnswer(e.target.value.toUpperCase())
                  }
                  placeholder="Enter CAPTCHA characters"
                  maxLength={6}
                  autoComplete="off"
                  required
                />

                <button
                  type="button"
                  className="back-button"
                  onClick={generateCaptcha}
                  style={{ marginTop: "10px" }}
                >
                  ↻ Refresh CAPTCHA
                </button>

              </div>

            </div>

          </section>

          <div className="submit-area">

            <button
              type="submit"
              className="submit-form-button"
            >
              {page === "edit-form"
                ? "Save Changes"
                : "Submit Medical Claim"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default App;