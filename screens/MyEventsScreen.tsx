
import React, { useState } from 'react';
import { Screen, Event } from '../types';
import { CalendarIcon, MapPinIcon, UsersIcon, ArrowRightIcon } from '../components/Icons';

interface MyEventsScreenProps {
    events: Event[];
    setCurrentScreen: (screen: Screen) => void;
    onViewDetails: (eventId: string) => void;
}

const MyEventCard: React.FC<{ event: Event; onViewDetails: (id: string) => void; }> = ({ event, onViewDetails }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col group transition-all hover:shadow-lg hover:-translate-y-1">
        <img src={event.image} alt={event.title} className="w-full h-40 object-cover rounded-t-xl" />
        <div className="p-4 flex flex-col flex-grow">
            <span className={`text-xs font-bold px-2 py-1 rounded-full self-start mb-2 ${
                event.status === 'Upcoming' ? 'bg-green-100 text-green-800' : 
                event.status === 'Past' ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'
            }`}>{event.status}</span>
            <h3 className="font-bold text-md text-sunai-dark flex-grow">{event.title}</h3>
            <div className="text-sm text-gray-500 space-y-2 mt-3">
                <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> <span>{event.date}</span></div>
                <div className="flex items-center gap-2"><MapPinIcon className="w-4 h-4" /> <span>{event.location}</span></div>
            </div>
             <button 
                onClick={() => onViewDetails(event.id)}
                className="w-full mt-4 bg-white border border-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
                View Details
            </button>
        </div>
    </div>
);


const EmptyState: React.FC<{ events: Event[], setCurrentScreen: (screen: Screen) => void; }> = ({ events, setCurrentScreen }) => (
    <div>
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-gray-800">No upcoming events</h3>
            <p className="text-gray-500 mt-1 mb-4 text-sm">You haven’t registered for any upcoming events yet.</p>
            <button
                onClick={() => setCurrentScreen(Screen.Events)}
                className="bg-sunai-dark text-white font-bold py-2 px-5 rounded-lg hover:bg-black transition-all"
            >
                Browse Events
            </button>
        </div>

        <div className="mt-12">
            <h3 className="text-2xl font-bold text-sunai-dark mb-4">Recommended Events</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {events.filter(e => !e.registered).slice(0, 3).map(event => (
                    <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                        <img src={event.image} alt={event.title} className="w-20 h-20 object-cover rounded-lg" />
                        <div>
                            <h4 className="font-bold text-sm text-sunai-dark">{event.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{event.date}</p>
                            <button onClick={() => setCurrentScreen(Screen.Events)} className="text-xs font-bold text-sunai-orange mt-2">Register</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-12">
             <h3 className="text-2xl font-bold text-sunai-dark mb-4">Event Tips & Insights</h3>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h4 className="font-bold text-lg text-sunai-dark">How to network effectively at startup events.</h4>
                <p className="text-gray-600 text-sm mt-2">Prepare a concise one-liner about your startup, focus on listening more than talking, and always follow up within 24 hours. Quality connections are more valuable than quantity.</p>
             </div>
        </div>
    </div>
);


const MyEventsScreen: React.FC<MyEventsScreenProps> = ({ events, setCurrentScreen, onViewDetails }) => {
    const [activeTab, setActiveTab] = useState('Upcoming');
    
    const registeredEvents = events.filter(e => e.registered);
    const upcomingEvents = registeredEvents.filter(e => e.status === 'Upcoming');
    const pastEvents = registeredEvents.filter(e => e.status === 'Past');

    const eventsToShow = activeTab === 'Upcoming' ? upcomingEvents : pastEvents;
    const tabCounts = {
        Upcoming: upcomingEvents.length,
        Past: pastEvents.length
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-sunai-dark">My Events</h1>
                    <p className="text-gray-600 mt-1">Manage your event registrations</p>
                </div>
                <button 
                    onClick={() => setCurrentScreen(Screen.Events)}
                    className="bg-sunai-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-black transition-colors flex items-center gap-2 mt-4 md:mt-0"
                >
                    Browse All Events
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {['Upcoming', 'Past'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab
                                ? 'border-sunai-orange text-sunai-orange'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-sunai-orange/10 text-sunai-orange' : 'bg-gray-100 text-gray-600'}`}>{tabCounts[tab as keyof typeof tabCounts]}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="mt-8">
                {eventsToShow.length === 0 ? (
                    <EmptyState events={events} setCurrentScreen={setCurrentScreen}/>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {eventsToShow.map(event => (
                            <MyEventCard key={event.id} event={event} onViewDetails={onViewDetails} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEventsScreen;