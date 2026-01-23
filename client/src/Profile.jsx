import React from 'react';

function Profile({ userProfile, onBack }) {
    if (!userProfile) {
        return (
            <div className="dashboard-container">
                <header className="header">
                    <h1>User Profile</h1>
                    <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
                </header>
                <div className="card">
                    <h3>No Profile Data Available</h3>
                    <p>Waiting for user profile information from telemetry...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="header">
                <h1>User Profile</h1>
                <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
            </header>

            <div className="grid">
                {/* Personal Information */}
                <div className="card">
                    <h3>Personal Information</h3>
                    <div style={{ marginTop: '1rem' }}>
                        {userProfile.age && (
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Age:</strong> {userProfile.age}
                            </div>
                        )}
                        {userProfile.conditions && (
                            <>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Heart Condition:</strong> {userProfile.conditions.has_heart_condition ? 'Yes' : 'No'}
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Athlete:</strong> {userProfile.conditions.is_athlete ? 'Yes' : 'No'}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Emergency Contacts */}
                <div className="card">
                    <h3>Emergency Contacts</h3>
                    {userProfile.contacts && userProfile.contacts.length > 0 ? (
                        <div style={{ marginTop: '1rem' }}>
                            {userProfile.contacts.map((contact, index) => (
                                <div key={index} className="contact-card">
                                    <div><strong>{contact.name}</strong></div>
                                    <div style={{ color: '#666', marginTop: '0.25rem' }}>{contact.phone}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ marginTop: '1rem', color: '#666' }}>No emergency contacts configured</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
