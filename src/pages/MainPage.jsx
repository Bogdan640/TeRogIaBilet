import React from 'react';
import { useNavigate } from "react-router-dom";
import 'D:\\School\\2ndY_S2\\MPP\\battlepass\\src\\styles\\MainPage.css';
import '../components/ButtonMainPageStyle.css'
import images from '../assets/MainPageImages/images.jpeg';
import last from '../assets/MainPageImages/last.webp';
import metal from '../assets/MainPageImages/metal1.jpg';


function MainPage() {

    const navigate = useNavigate();

    return (

            <div className="main-page">
                <header>
                    <a href="#">Q&A</a>
                    <a href="#">INFO</a>
                    <a href="#">CONTACT</a>
                    <a onClick={() => navigate("/signin")} style={{cursor: 'pointer'}}>SIGN IN</a>
                </header>

                <section className="startup_zone">
                    <div className = "textbox">
                        <h1>Take a ticket to your next hangover</h1>
                    </div>
                </section>

                <div className="container">
                    <section className="image-grid">
                        <div className="image-item-first">
                            <img src={metal} alt="Background" />
                            <p1>
                                How Long Can You Keep the Fire Burning?
                            </p1>
                            <p>
                                Be ready for the best festival that will wake up all of your emotions
                            </p>
                            <a href="#" className="custom-button position-button1">
                                Take a look
                            </a>
                        </div>
                        <div className="image-item-second">
                            <img src={images} alt="Festival" />
                            <p className="title">
                                More of an ALL-IN PLAYER?
                            </p>
                            <p className="context">
                                Concentrate your essence in a night full of wild experiences with the top band of the year
                            </p>
                            <a href="#" className="custom-button position-button2">
                                Give it a TRY
                            </a>
                        </div>
                    </section>

                    <section className="what-we-offer">
                        <h2>What do we offer? Everything!</h2>
                        <img src={last} alt="Show more" />
                        <button className="custom-button position-button3"
                                onClick={() => navigate("/Events")} >
                            Check here
                        </button>
                    </section>

                    <section className="section-heading-grid">
                        <div>
                            <h3>Section heading</h3>
                            <p>
                                Really hard for whatever you'd like to do. And from just the
                                right place, you can make every story very much story.
                            </p>
                            <p>
                                Really hard for whatever you'd like to do. And from just the
                                right place, you can make every story very much story.
                            </p>
                        </div>
                        <div>
                            <p>
                                Each and for whatever provides to requires And from just the
                                right place, you can make every story very much story.
                            </p>
                            <p>
                                Each and for whatever provides to requires And from just the
                                right place, you can make every story very much story.
                            </p>
                        </div>
                    </section>

                    <footer>
                        <div className="footer-content">
                            <p>Footer content goes here...</p>
                        </div>
                    </footer>
                </div>
            </div>
    );
}

export default MainPage;


