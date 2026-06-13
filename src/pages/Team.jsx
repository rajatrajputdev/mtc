import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import "./Team.css";

const images = import.meta.glob("../assets/*.{png,jpg,jpeg,JPG,PNG,JPEG}", {
  eager: true,
  import: "default"
});

const getImage = (name) => images[`../assets/${name}`];

// Fallback avatar: shows initials when image file is missing
const FallbackAvatar = ({ name }) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return <div className="member-fallback-avatar">{initials}</div>;
};

const team = [
  {
    name: "Abhishek Agrawal",
    role: "President",
    bio: "President of the Microsoft Tech Community at Amity Tech University.",
    img: ""
  },
  {
    name: "Meher Bamrah",
    role: "VP",
    bio: "“ਜਿਵੇਂ ਸੂਰਜਮੁਖੀ ਸੂਰਜ ਵੱਲ ਮੁੜਦਾ ਹੈ, ਤਿਵੇਂ ਮਨ ਵਾਹਿਗੁਰੂ ਵੱਲ ਮੁੜਨਾ ਚਾਹੀਦਾ ਹੈ।”\nJust like a sunflower turns toward the sun, the mind should turn toward the Divine. 🌻\n\nAlways curious about how things work and how they can be built better. Mostly found exploring AI/ML, research, design, and leadership, building impactful projects and working with teams to create meaningful innovation.",
    linkedin: "https://www.linkedin.com/in/meherbamrah/",
    github: "https://github.com/MeherBamrah",
    img: ""
  },
  {
    name: "Sanya",
    role: "Gen Sec",
    bio: "General Secretary of the Microsoft Tech Community.",
    img: ""
  },
  {
    name: "Kamakshi Bagga",
    role: "Treasurer",
    bio: "Treasurer of the Microsoft Tech Community.",
    img: ""
  },
  {
    name: "Suhani Sharma",
    role: "Design Lead",
    bio: "Aspiring developer passionate about web development, UI/UX design, and exploring AI/ML. Enjoys creating clean, user-friendly interfaces and continuously learning modern technologies to build innovative solutions.",
    linkedin: "https://www.linkedin.com/in/suhani-sharma-04a546272",
    github: "https://github.com/SuhaniSharma1309",
    img: getImage("Suhani.jpg")
  },
  {
    name: "Shanvi",
    role: "Design Co-lead",
    bio: "Creative designer passionate about exploring new ideas and learning new things. Enjoy designing posters and social media graphics, experimenting with different styles, and turning ideas into engaging visuals that connect with people.",
    linkedin: "https://www.linkedin.com/in/shanvi-singh-961605377?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    github: "https://github.com/Shanvi-singh001",
    img: getImage("Shanvi.jpg")
  },
  {
    name: "Jivyansh Raghuvanshi",
    role: "Content Lead",
    bio: "Turning curiosity to Code and Content. Exploring AI through deep learning and computer vision while contributing to the club as Content Team Lead and sharing ideas that make tech more accessible.",
    linkedin: "linkedin.com/in/jivanshraghuvanshi",
    github: "https://github.com/Jivi1512",
    img: getImage("Jivyansh.jpg")
  },
  {
    name: "Anushka",
    role: "Content Co-lead",
    bio: "I'm passionate about AI and machine learning, enjoy building small projects, and love exploring new technologies. I also enjoy swimming, driving, reading",
    linkedin: "http://linkedin.com/in/anushka-marwaha-0ba88933b",
    github: "https://github.com/anushkamarwaha",
    img: getImage("Anushka.jpg")
  },
  {
    name: "Saisha",
    role: "AI Lead",
    bio: "I am a pre-final year computer science student passionate about Machine Learning, Cloud and Generative AI. I enjoy building practical projects, exploring emerging technologies, and continuously learning to create meaningful, real-world solutions.",
    linkedin: "https://www.linkedin.com/in/saisha-goel",
    github: "https://github.com/saishagoel27",
    img: getImage("Saisha.jpg")
  },
  {
    name: "Zia",
    role: "Web Dev Lead",
    bio: "Web Dev Lead for the Microsoft Tech Community.",
    img: ""
  },
  {
    name: "Shaksham",
    role: "Social Media Lead",
    bio: "Builder who enjoys creating smart tech and beautiful visuals. I explore AI, full-stack development, and modern tools while also crafting cinematic edits blending technology and creativity to turn ideas into engaging digital experiences.",
    linkedin: "https://tinyurl.com/58hm3h2y",
    github: "https://github.com/saksham3366",
    img: getImage("Saksham.jpg")
  },
  {
    name: "Soumyapriya",
    role: "Marketing Lead",
    bio: "I am the head of Marketing at MTC. I guide the team members on pitching strategies and event promotions, along with contributing to core operations and management. I also contribute to projects under the AIML domain.",
    linkedin: "https://www.linkedin.com/in/soumya-priya-datta-437a66345?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    github: "https://github.com/Soumyapriyadatta",
    img: "https://i.pravatar.cc/600?img=5"
  },
  {
    name: "Ojaswi Singh",
    role: "Operations Manager",
    bio: "Core member specializing in creative design and event promotion. I develop engaging posters and visual content that help highlight club activities and strengthen the club's outreach and presence.",
    linkedin: "https://www.linkedin.com/in/ojaswi-singh-74701836a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    img: getImage("Ojaswi.jpg")
  }
];

function Team() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [navOffset, setNavOffset] = useState(76);
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  const resolveNavOffset = () => {
    const nav = document.querySelector(".msft-nav");
    if (!nav) return 76;
    const rect = nav.getBoundingClientRect();
    return Math.max(Math.round(rect.bottom), 0);
  };

  const openProfile = useCallback((member) => {
    setSelectedMember(member);
  }, []);

  useEffect(() => {
    if (selectedMember) {
      document.body.classList.add('modal-open');
      if (window.lenis) window.lenis.stop();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      if (window.lenis) window.lenis.start();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('modal-open');
      if (window.lenis) window.lenis.start();
      document.body.style.overflow = '';
    };
  }, [selectedMember]);

  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === "Escape") setSelectedMember(null);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  useEffect(() => {
    const syncNavOffset = () => setNavOffset(resolveNavOffset());
    syncNavOffset();
    window.addEventListener("resize", syncNavOffset, { passive: true });
    return () => window.removeEventListener("resize", syncNavOffset);
  }, []);

  // Scroll-reveal: auto-reveal member images row by row when scrolling (all devices)
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const members = grid.querySelectorAll(".member");
    if (!members.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-revealed");
          } else {
            entry.target.classList.remove("scroll-revealed");
          }
        });
      },
      {
        root: null,
        rootMargin: "-25% 0px -35% 0px", // Reveal when in middle 40% of viewport (approx 2 rows)
        threshold: 0.15
      }
    );

    members.forEach((m) => observer.observe(m));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="page2" ref={containerRef} className="team-container">

      <div className="team-layout-wrapper">
        <div className="team-title-fixed">
          <h1>Meet <br /> The <br /> Team</h1>
          <p className="team-title-sub">
            Click a member to view their profile.
          </p>
        </div>

        <div className="team-scroll-area">
          <div className="team-grid" ref={gridRef}>
            {team.map((member) => (
              <div
                key={member.name}
                className="member"
                onClick={() => openProfile(member)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openProfile(member);
                  }
                }}
                aria-label={`Open profile for ${member.name}`}
              >
                {member.img ? (
                  <img src={member.img} alt={member.name} loading="lazy" decoding="async" />
                ) : (
                  <FallbackAvatar name={member.name} />
                )}
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedMember && (
              <motion.div
                className="profile-overlay"
                onClick={() => setSelectedMember(null)}
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ top: 0 }}
              >
                <motion.div
                  className="profile-view"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                  style={{ top: 0, height: '100vh' }}
                >
                  <button
                    className="close-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMember(null);
                    }}
                    aria-label="Close profile"
                  />

                  <div className="profile-scroll" data-lenis-prevent>
                    <div className="flash-image">
                      {selectedMember.img ? (
                        <img src={selectedMember.img} alt={selectedMember.name} />
                      ) : (
                        <FallbackAvatar name={selectedMember.name} />
                      )}
                    </div>

                    <div className="flash-info">
                      <div className="flash-header">
                        <h2>{selectedMember.name}</h2>
                        <p className="role">{selectedMember.role}</p>
                        {selectedMember.teamLine && <p className="team-line">{selectedMember.teamLine}</p>}
                      </div>

                      <div className="flash-row">
                        <div className="flash-left">
                          {selectedMember.linkedin && (
                            <a
                              href={selectedMember.linkedin}
                              target="_blank"
                              rel="noreferrer"
                            >
                              LinkedIn
                            </a>
                          )}
                          {selectedMember.github && (
                            <a
                              href={selectedMember.github}
                              target="_blank"
                              rel="noreferrer"
                            >
                              GitHub
                            </a>
                          )}
                        </div>

                        <div className="flash-right">
                          <p className="bio-text">{selectedMember.bio}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

    </section>
  );
}

export default Team;