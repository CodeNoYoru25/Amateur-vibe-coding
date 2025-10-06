// Import Kaboom as an ES module from the CDN (latest)
import kaboom from "https://unpkg.com/kaboom/dist/kaboom.mjs";

// Initialize Kaboom with a fixed canvas size of 800x400
// We let Kaboom create and insert the canvas element for us
kaboom({
  width: 800,
  height: 400,
  // crisp pixel scaling looks nice for simple shapes
  crisp: true,
  // disable automatic focus so arrow keys don't scroll the page
  // when the canvas is focused
  global: true,
});

// --- SCENE SETUP -----------------------------------------------------

// Set a blue sky background (RGB: 135, 206, 235)
// If setBackground is unavailable on older versions, we also add a fixed
// full-screen rect as a fallback.
const skyBlue = rgb(135, 206, 235);
if (typeof setBackground === "function") {
  setBackground(skyBlue);
} else {
  add([
    rect(width(), height()),
    color(skyBlue),
    pos(0, 0),
    fixed(),
    z(-10),
  ]);
}

// Enable gravity so the player falls back down to the ground
setGravity(1200);

// --- WORLD GEOMETRY --------------------------------------------------

// Green ground spanning the bottom of the scene
const groundHeight = 40;
add([
  rect(width(), groundHeight),
  color(34, 139, 34), // forest green
  pos(0, height() - groundHeight),
  area(),
  body({ isStatic: true }), // static body so it doesn't fall
]);

// --- PLAYER ----------------------------------------------------------

// Red square player with collision and physics body
const player = add([
  rect(24, 24),
  color(220, 20, 60), // crimson red
  pos(100, 0),        // start near top-left so gravity is visible
  area(),
  body(),             // dynamic body so gravity applies
  anchor("center"),
  // Use a distinct property name to avoid clashing with Kaboom's body component
  { moveSpeed: 220, playerJumpForce: 420 },
]);

// --- COINS -----------------------------------------------------------

// Helper to spawn a coin at a random valid X coordinate
function spawnCoin() {
  const margin = 40;
  const x = rand(margin, width() - margin);
  const y = height() - groundHeight - 16; // sit just above the ground
  return add([
    rect(16, 16),
    color(255, 215, 0), // gold
    pos(x, y),
    area(),
    anchor("center"),
    "coin",
  ]);
}

// Spawn the first coin
spawnCoin();

// --- UI: SCORE -------------------------------------------------------

let score = 0;
const scoreLabel = add([
  text(`Score: ${score}`, { size: 18 }),
  pos(12, 12),
  color(0, 0, 0), // black text for readability on sky
  fixed(),        // keep UI in place even if camera moves
  z(100),
]);

// --- CONTROLS --------------------------------------------------------

// Horizontal movement with arrow keys
onKeyDown("left", () => { player.move(-player.moveSpeed, 0); });
onKeyDown("right", () => { player.move(player.moveSpeed, 0); });
// Space to jump (only if on the ground)
onKeyPress("space", () => { if (player.isGrounded()) { player.jump(player.playerJumpForce); } });

// --- INTERACTIONS ----------------------------------------------------

// When the player touches the coin, remove it and increase the score
player.onCollide("coin", (c) => {
  destroy(c);
  score += 1;
  scoreLabel.text = `Score: ${score}`;
  // Spawn a new coin so the game can continue
  spawnCoin();
});

// Ensure the player doesn't slide forever: apply gentle friction
onUpdate(() => {
  // Also support polling-based controls in case key events are not firing
  if (isKeyDown && isKeyDown("left")) player.move(-player.moveSpeed, 0);
  if (isKeyDown && isKeyDown("right")) player.move(player.moveSpeed, 0);
  if (isKeyPressed && isKeyPressed("space") && player.isGrounded()) {
    player.jump(player.playerJumpForce);
  }

  // Clamp x within the scene bounds so we stay in the 800x400 canvas
  player.pos.x = clamp(player.pos.x, 12, width() - 12);
});


