const fs = require('fs');
let code = fs.readFileSync('D:/EduSphere/src/App.tsx', 'utf8');

const postsSection = `<div style={{ marginTop: '48px', maxWidth: '500px' }}>`;
const fixedPostsSection = `</div><div style={{ marginTop: '24px', maxWidth: '500px' }}>`;

code = code.replace(postsSection, fixedPostsSection);

const endingDivs = `</div>
                  </div>

                </div>
              </div>
            )}`;

const fixedEndingDivs = `</div>
                  </div>

              </div>
            )}`;

code = code.replace(endingDivs, fixedEndingDivs);

fs.writeFileSync('D:/EduSphere/src/App.tsx', code);
console.log('Profile layout fixed.');
