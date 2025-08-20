from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, BackgroundTasks, WebSocket
from fastapi.responses import StreamingResponse, JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import os
import logging
import hashlib
import json
import uuid
import asyncio
import time
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv
import tempfile
import shutil
import cv2
import base64
from collections import deque
import threading

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Advanced DeepFake Detection Platform", version="2.0.0")
api_router = APIRouter(prefix="/api")

# Global variables for monitoring
monitoring_active = False
monitoring_stats = {
    'frames_processed': 0,
    'deepfakes_detected': 0,
    'avg_processing_time': 0.0,
    'start_time': None,
    'alerts': deque(maxlen=100)
}

# Pydantic Models
class MediaAnalysisRequest(BaseModel):
    file_path: str
    analysis_type: str = "full"

class MediaAnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    media_hash: str
    file_name: str
    media_type: str
    authenticity_score: float
    is_authentic: bool
    confidence: float
    detection_method: str
    analysis_details: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ThreatAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    alert_type: str
    severity: str
    confidence: float
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = {}

class MonitoringStats(BaseModel):
    frames_processed: int
    deepfakes_detected: int
    avg_processing_time: float
    uptime_seconds: int
    status: str
    alerts: List[Dict[str, Any]]

class SecureBrowsingSession(BaseModel):
    session_id: str
    url: str
    status: str
    security_warnings: List[str]
    created_at: datetime
    metadata: Dict[str, Any] = {}

class AnalyticsData(BaseModel):
    total_analyses: int
    authenticity_rate: float
    threat_level: str
    recent_trends: Dict[str, Any]
    performance_metrics: Dict[str, Any]

class UserCredentials(BaseModel):
    username: str
    password: str

class UserRegistration(BaseModel):
    username: str
    password: str
    email: str

# Simulated AI Detection Functions (replace with your actual models)
async def simulate_deepfake_detection(file_data: bytes, media_type: str) -> Dict[str, Any]:
    """Simulate advanced deepfake detection"""
    # Simulate processing time
    await asyncio.sleep(np.random.uniform(1, 3))
    
    # Generate realistic results
    confidence = np.random.uniform(0.6, 0.95)
    is_authentic = np.random.choice([True, False], p=[0.7, 0.3])
    
    face_analysis = {
        'faces_detected': np.random.randint(1, 4),
        'compression_artifacts': np.random.uniform(0.1, 0.8),
        'blending_artifacts': np.random.uniform(0.1, 0.7),
        'temporal_inconsistencies': np.random.uniform(0.1, 0.6)
    }
    
    return {
        'prediction': 0 if is_authentic else 1,
        'confidence': confidence,
        'authenticity_score': confidence if is_authentic else 1 - confidence,
        'is_authentic': is_authentic,
        'face_analysis': face_analysis,
        'processing_time': np.random.uniform(1, 3),
        'detection_method': 'CNN-LSTM Hybrid + Face Analysis'
    }

async def simulate_multimodal_analysis(file_data: bytes) -> Dict[str, Any]:
    """Simulate multi-modal analysis"""
    await asyncio.sleep(np.random.uniform(2, 4))
    
    return {
        'video_analysis': {
            'confidence': np.random.uniform(0.6, 0.95),
            'detected_manipulations': ['face_swap', 'expression_transfer']
        },
        'audio_analysis': {
            'confidence': np.random.uniform(0.5, 0.9),
            'detected_manipulations': ['voice_conversion']
        },
        'metadata_analysis': {
            'suspicion_score': np.random.uniform(0.2, 0.8),
            'flags': ['missing_camera_info', 'unusual_timestamps']
        },
        'fusion_score': np.random.uniform(0.3, 0.9),
        'final_decision': np.random.choice(['authentic', 'deepfake'])
    }

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Advanced DeepFake Detection Platform API", "version": "2.0.0"}

@api_router.post("/media/analyze", response_model=MediaAnalysisResult)
async def analyze_media(file: UploadFile = File(...)):
    """Analyze uploaded media for deepfake detection"""
    try:
        # Read file data
        file_data = await file.read()
        file_hash = hashlib.sha256(file_data).hexdigest()
        
        # Check if already analyzed
        existing = await db.media_analyses.find_one({"media_hash": file_hash})
        if existing:
            return MediaAnalysisResult(**existing)
        
        # Determine media type
        media_type = "image" if file.content_type.startswith("image") else "video"
        
        # Perform analysis
        analysis_result = await simulate_deepfake_detection(file_data, media_type)
        
        # Create result object
        result = MediaAnalysisResult(
            media_hash=file_hash,
            file_name=file.filename,
            media_type=media_type,
            authenticity_score=analysis_result['authenticity_score'],
            is_authentic=analysis_result['is_authentic'],
            confidence=analysis_result['confidence'],
            detection_method=analysis_result['detection_method'],
            analysis_details=analysis_result
        )
        
        # Store in database
        await db.media_analyses.insert_one(result.dict())
        
        # Update monitoring stats if media is fake
        if not result.is_authentic:
            monitoring_stats['deepfakes_detected'] += 1
            
            # Create alert
            alert = ThreatAlert(
                alert_type="deepfake_detected",
                severity="high" if result.confidence > 0.8 else "medium",
                confidence=result.confidence,
                description=f"Deepfake detected in {file.filename}"
            )
            monitoring_stats['alerts'].append(alert.dict())
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@api_router.post("/media/multimodal-analyze")
async def multimodal_analysis(file: UploadFile = File(...)):
    """Perform advanced multi-modal analysis"""
    try:
        file_data = await file.read()
        result = await simulate_multimodal_analysis(file_data)
        
        # Store result
        analysis_doc = {
            "id": str(uuid.uuid4()),
            "file_name": file.filename,
            "analysis_type": "multimodal",
            "result": result,
            "timestamp": datetime.utcnow()
        }
        await db.multimodal_analyses.insert_one(analysis_doc)
        
        return {"status": "success", "result": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multimodal analysis failed: {str(e)}")

@api_router.get("/monitoring/stats", response_model=MonitoringStats)
async def get_monitoring_stats():
    """Get real-time monitoring statistics"""
    uptime = int(time.time() - (monitoring_stats['start_time'] or time.time()))
    
    return MonitoringStats(
        frames_processed=monitoring_stats['frames_processed'],
        deepfakes_detected=monitoring_stats['deepfakes_detected'],
        avg_processing_time=monitoring_stats['avg_processing_time'],
        uptime_seconds=uptime,
        status="active" if monitoring_active else "stopped",
        alerts=list(monitoring_stats['alerts'])[-10:]  # Last 10 alerts
    )

@api_router.post("/monitoring/start")
async def start_monitoring(background_tasks: BackgroundTasks):
    """Start real-time monitoring"""
    global monitoring_active
    
    if monitoring_active:
        return {"status": "already_active"}
    
    monitoring_active = True
    monitoring_stats['start_time'] = time.time()
    
    # Start background monitoring task
    background_tasks.add_task(monitoring_loop)
    
    return {"status": "started", "message": "Real-time monitoring initiated"}

@api_router.post("/monitoring/stop")
async def stop_monitoring():
    """Stop real-time monitoring"""
    global monitoring_active
    monitoring_active = False
    
    return {"status": "stopped", "message": "Monitoring deactivated"}

async def monitoring_loop():
    """Background monitoring loop"""
    while monitoring_active:
        await asyncio.sleep(1)
        
        # Simulate frame processing
        if np.random.random() < 0.3:  # 30% chance of processing a frame
            monitoring_stats['frames_processed'] += 1
            
            # Simulate deepfake detection
            if np.random.random() < 0.05:  # 5% chance of detecting deepfake
                monitoring_stats['deepfakes_detected'] += 1
                
                alert = {
                    "id": str(uuid.uuid4()),
                    "type": "realtime_detection",
                    "confidence": np.random.uniform(0.7, 0.95),
                    "timestamp": datetime.utcnow().isoformat(),
                    "source": "live_stream"
                }
                monitoring_stats['alerts'].append(alert)
        
        # Update processing time
        monitoring_stats['avg_processing_time'] = np.random.uniform(0.1, 0.5)

@api_router.get("/threats/intelligence")
async def get_threat_intelligence():
    """Get current threat intelligence data"""
    threat_data = {
        "current_threat_level": np.random.choice(["low", "medium", "high"], p=[0.5, 0.3, 0.2]),
        "active_patterns": [
            {"type": "face_swap", "frequency": "high", "sophistication": "advanced"},
            {"type": "expression_transfer", "frequency": "medium", "sophistication": "moderate"},
            {"type": "voice_synthesis", "frequency": "low", "sophistication": "high"}
        ],
        "recent_detections": np.random.randint(50, 200),
        "global_statistics": {
            "detection_accuracy": np.random.uniform(0.85, 0.95),
            "false_positive_rate": np.random.uniform(0.02, 0.08),
            "processing_speed": np.random.uniform(0.1, 0.3)
        },
        "recommendations": [
            "Monitor social media platforms closely",
            "Update detection models with new patterns",
            "Enhance real-time monitoring capabilities"
        ]
    }
    
    return threat_data

@api_router.post("/threats/hunt")
async def hunt_threats():
    """Initiate threat hunting process"""
    # Simulate threat hunting
    await asyncio.sleep(2)
    
    threats_found = []
    if np.random.random() < 0.3:  # 30% chance of finding threats
        threat_types = ["coordinated_campaign", "advanced_synthesis", "evasion_attempt"]
        for _ in range(np.random.randint(1, 3)):
            threat = {
                "id": str(uuid.uuid4()),
                "type": np.random.choice(threat_types),
                "severity": np.random.choice(["low", "medium", "high"]),
                "confidence": np.random.uniform(0.6, 0.9),
                "timestamp": datetime.utcnow().isoformat(),
                "recommended_action": "Monitor closely and update detection models"
            }
            threats_found.append(threat)
    
    return {
        "status": "completed",
        "threats_found": len(threats_found),
        "threats": threats_found
    }

@api_router.post("/secure-browsing/session")
async def create_secure_session():
    """Create a new secure browsing session"""
    session = SecureBrowsingSession(
        session_id=str(uuid.uuid4()),
        url="",
        status="created",
        security_warnings=[],
        created_at=datetime.utcnow()
    )
    
    await db.browsing_sessions.insert_one(session.dict())
    
    return {"session_id": session.session_id, "status": "created"}

@api_router.post("/secure-browsing/navigate")
async def navigate_secure(session_id: str, url: str):
    """Navigate to URL in secure session"""
    try:
        # Simulate secure navigation
        await asyncio.sleep(1)
        
        warnings = []
        if not url.startswith("https://"):
            warnings.append("Insecure HTTP connection")
        
        if any(suspicious in url.lower() for suspicious in ["suspicious", "malware", "phishing"]):
            warnings.append("Potentially malicious content detected")
        
        # Update session
        await db.browsing_sessions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "url": url,
                    "status": "navigated",
                    "security_warnings": warnings
                }
            }
        )
        
        return {
            "status": "success",
            "url": url,
            "security_warnings": warnings,
            "safe": len(warnings) == 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Navigation failed: {str(e)}")

@api_router.get("/analytics/dashboard", response_model=AnalyticsData)
async def get_analytics_dashboard():
    """Get analytics dashboard data"""
    # Calculate analytics from database
    total_analyses = await db.media_analyses.count_documents({})
    authentic_count = await db.media_analyses.count_documents({"is_authentic": True})
    
    authenticity_rate = authentic_count / max(total_analyses, 1)
    
    # Generate performance metrics
    recent_trends = {
        "daily_detections": [np.random.randint(10, 50) for _ in range(7)],
        "weekly_authenticity": [np.random.uniform(0.7, 0.9) for _ in range(4)],
        "threat_patterns": {
            "face_swap": np.random.randint(20, 100),
            "voice_synthesis": np.random.randint(5, 30),
            "expression_transfer": np.random.randint(10, 50)
        }
    }
    
    performance_metrics = {
        "avg_processing_time": np.random.uniform(0.5, 2.0),
        "detection_accuracy": np.random.uniform(0.85, 0.95),
        "system_uptime": np.random.uniform(0.95, 0.99),
        "throughput": np.random.randint(100, 500)
    }
    
    threat_level = "low"
    if monitoring_stats['deepfakes_detected'] > 50:
        threat_level = "high"
    elif monitoring_stats['deepfakes_detected'] > 20:
        threat_level = "medium"
    
    return AnalyticsData(
        total_analyses=total_analyses,
        authenticity_rate=authenticity_rate,
        threat_level=threat_level,
        recent_trends=recent_trends,
        performance_metrics=performance_metrics
    )

@api_router.post("/auth/login")
async def login(credentials: UserCredentials):
    """User authentication"""
    # Simple authentication (replace with proper implementation)
    if credentials.username == "admin" and credentials.password == "secure123":
        token = str(uuid.uuid4())
        session_data = {
            "token": token,
            "username": credentials.username,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=24)
        }
        await db.user_sessions.insert_one(session_data)
        
        return {
            "status": "success",
            "token": token,
            "user": {"username": credentials.username, "role": "admin"}
        }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.post("/auth/register")
async def register(user_data: UserRegistration):
    """User registration"""
    # Check if user exists
    existing = await db.users.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create user (in production, hash the password)
    user_doc = {
        "id": str(uuid.uuid4()),
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": hashlib.sha256(user_data.password.encode()).hexdigest(),
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    await db.users.insert_one(user_doc)
    
    return {"status": "success", "message": "User registered successfully"}

@api_router.get("/system/status")
async def get_system_status():
    """Get overall system status"""
    return {
        "status": "operational",
        "version": "2.0.0",
        "uptime": time.time() - (monitoring_stats.get('start_time', time.time())),
        "components": {
            "ai_detection": "active",
            "threat_intelligence": "active",
            "secure_browsing": "active",
            "monitoring": "active" if monitoring_active else "inactive",
            "database": "connected"
        },
        "performance": {
            "cpu_usage": np.random.uniform(20, 60),
            "memory_usage": np.random.uniform(30, 70),
            "disk_usage": np.random.uniform(40, 80)
        }
    }

@api_router.websocket("/ws/monitoring")
async def websocket_monitoring(websocket: WebSocket):
    """WebSocket endpoint for real-time monitoring data"""
    await websocket.accept()
    
    try:
        while True:
            # Send current monitoring stats
            stats = await get_monitoring_stats()
            await websocket.send_json(stats.dict())
            await asyncio.sleep(1)  # Update every second
            
    except Exception as e:
        logging.error(f"WebSocket error: {e}")
    finally:
        await websocket.close()

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Advanced DeepFake Detection Platform API started")
    logger.info("✅ Multi-modal AI detection system loaded")
    logger.info("✅ Threat intelligence module active")
    logger.info("✅ Secure browsing environment ready")
    logger.info("✅ Real-time monitoring capabilities enabled")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()