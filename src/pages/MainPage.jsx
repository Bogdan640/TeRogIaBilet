import React from 'react';
import 'D:\\School\\2ndY_S2\\MPP\\battlepass\\src\\styles\\MainPage.css';
import background1 from 'D:\\School\\2ndY_S2\\MPP\\battlepass\\src\\assets\\MainPageImages\\background1.jpeg';
import images from 'D:\\School\\2ndY_S2\\MPP\\battlepass\\src\\assets\\MainPageImages\\images.jpeg';
import last from 'D:\\School\\2ndY_S2\\MPP\\battlepass\\src\\assets\\MainPageImages\\last.webp';

function MainPage() {
    return (
        <div className="main-page">
            <header>
                <a href="#">Q&A</a>
                <a href="#">INFO</a>
                <a href="#">CONTACT</a>
                <a href="#">SIGN IN</a>
            </header>

            <section className="startup_zone">
                <div className = "textbox">
                    <h1>Take a ticket to your next hangover</h1>
                </div>
            </section>

            <div className="container">
                <section className="image-grid">
                    <div className="image-item">
                        <img src={background1} alt="Background" />
                        <p>
                            New Levels can you keep up? Be ready for the next festival that will
                            make all of your machines.
                        </p>
                        <a href="#" className="button">
                            Take a look
                        </a>
                    </div>
                    <div className="image-item">
                        <img src={images} alt="Festival" />
                        <p>
                            More at an All-In Concert. Celebrate your success in a night full
                            of until experiences with the top band of the year.
                        </p>
                        <a href="#" className="button">
                            Give it a TRY
                        </a>
                    </div>
                </section>

                <section className="what-we-offer">
                    <h2>What do we offer? Everything!</h2>
                    <img src={last} alt="Show more" />
                    <a href="#" className="button">
                        Check here
                    </a>
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


