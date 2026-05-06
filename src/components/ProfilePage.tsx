import { Heart, MapPin, Radio, UserRound, UsersRound } from "lucide-react";
import type { AppData } from "../types";
import { navigate } from "../utils/routing";

interface ProfilePageProps {
  data: AppData;
  username: string;
  onFollow?: (username: string) => void;
}

export function ProfilePage({ data, username, onFollow }: ProfilePageProps) {
  const profile = data.profiles?.find((item) => item.username === username);
  if (profile?.isPublic === false) {
    return (
      <main className="publicPage">
        <h1>Private driver profile</h1>
        <p>This driver is keeping their profile private.</p>
      </main>
    );
  }
  const tunes = data.tunes.filter((tune) => tune.ownerUsername === username && tune.visibility === "public");
  const likesReceived = tunes.reduce((total, tune) => total + (tune.likeCount ?? 0), 0);
  const cloneCount = tunes.reduce((total, tune) => total + (tune.cloneCount ?? 0), profile?.cloneCount ?? 0);
  const isFollowing = data.follows?.some((follow) => follow.followingUsername === username);

  return (
    <main className="publicPage">
      <header className="profileHeader">
        <div className="avatar">{profile?.photoUrl ? <img src={profile.photoUrl} alt="" /> : <UserRound size={34} />}</div>
        <div>
          <p>Driver profile</p>
          <h1>{profile?.displayName ?? username}</h1>
          <span>{tunes.length} public tunes · {cloneCount} clones · {profile?.followerCount ?? data.follows?.filter((follow) => follow.followingUsername === username).length ?? 0} followers</span>
        </div>
        <button className="smallPill" type="button" onClick={() => onFollow?.(username)}>{isFollowing ? "Following" : "Follow"}</button>
      </header>

      <section className="communityFeatureGrid">
        <section><Heart size={18} /><strong>{profile?.tuneLikesReceived ?? likesReceived}</strong><span>Likes received</span></section>
        <section><Radio size={18} /><strong>{profile?.favoriteChassis ?? "Any chassis"}</strong><span>Favorite chassis</span></section>
        <section><MapPin size={18} /><strong>{profile?.homeTrack ?? tunes[0]?.track ?? "Track not set"}</strong><span>Home track</span></section>
      </section>

      <section className="publicSection">
        <h2>Recent activity</h2>
        <div className="publicTimeline">
          {(profile?.recentActivity?.length ? profile.recentActivity : tunes.slice(0, 3).map((tune) => `Shared ${tune.name}`)).map((activity) => (
            <article key={activity}>
              <strong>{activity}</strong>
              <span>RC Drift Sync community</span>
            </article>
          ))}
        </div>
      </section>

      <section className="publicSection">
        <h2>
          <UsersRound size={19} />
          Public tunes
        </h2>
        <div className="libraryList">
          {tunes.map((tune) => (
            <button key={tune.id} type="button" onClick={() => navigate(`/t/${tune.shareId ?? tune.id}`)}>
              <strong>{tune.name}</strong>
              <span>{tune.track} · {tune.surface} · {tune.rating}/5</span>
              <em>{tune.tags.join(" / ")}</em>
              <small>{tune.likeCount ?? 0} likes · {tune.cloneCount ?? 0} clones</small>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
