
From Coq Require Wf_nat.
From Coq Require Import PeanoNat Lia.

Definition half (x : nat) : option nat :=
  if PeanoNat.Nat.Even_Odd_dec x
  then (* even *)
    Some (Nat.div2 x)
  else (* odd *)
    None
.

Lemma half_some :
  forall x y : nat,
  half x = Some y ->
    y + y = x
.
  unfold half.
  intros x y h.
  destruct (Nat.Even_Odd_dec x) as [h' |];
    [| congruence].
  inversion_clear h.
  rewrite Nat.Even_double by auto.
  unfold Nat.double in *; lia.
Qed.

Corollary half_lt :
  forall x y : nat,
  x <> 0 ->
  half x = Some y ->
    y < x
.
  intros x y not0 h; apply half_some in h; lia.
Qed.

Fixpoint power_of_2 (x : nat) (acc : Acc Nat.lt x) : bool.
  refine (
    if Nat.eq_dec x 0
    then (* if x = 0 then x is not a power of 2 *)
      false
    else
      if Nat.eq_dec x 1
      then (* if x = 1 then x is a power of 2 *)
        true
      else
        match half x with
        | Some y =>
          power_of_2 y (Acc_inv acc _)
        | None =>
          false
        end
  ).
  (* proof that y < x: unprovable *)
Abort.

Fixpoint power_of_2' (x : nat) (acc : Acc Nat.lt x) : bool.
  refine (
    if Nat.eq_dec x 0
    then (* if x = 0 then x is not a power of 2 *)
      false
    else
      if Nat.eq_dec x 1
      then (* if x = 1 then x is a power of 2 *)
        true
      else
        match half x as half' return half x = half' -> _ with
        | Some y => fun h' =>
          (* _ needs a term of type y < x *)
          power_of_2' y (Acc_inv acc _)
        | None => fun h' =>
          false
        end eq_refl
  ).
  (* proof that y < x *)
  apply half_lt; auto.
Defined.

Lemma power_of_2'_true :
  forall x : nat,
  forall acc : Acc Nat.lt x,
  power_of_2' x acc = true ->
    exists e : nat, Nat.pow 2 e = x
.
  induction x as [x ih] using (well_founded_ind Wf_nat.lt_wf).
  intros [acc] h; simpl in *.
  destruct (Nat.eq_dec x 0) as [h' | h'];
    [congruence |].
  destruct (Nat.eq_dec x 1) as [h'' | h''].
  - exists 0; auto.
  - Fail destruct (half x).
    case_eq (half x).
    * intros y is_some.
      Fail rewrite is_some in h.
Abort.

Inductive dep_option
  (t : Type)
  (P_some : t -> Prop)
  (P_none : Prop)
: Type :=
  | dep_option_some :
    forall x : t, P_some x -> dep_option t P_some P_none
  | dep_option_none :
    P_none -> dep_option t P_some P_none
.

#[global]
Arguments dep_option_some {_} {_} {_} (_) (_).

#[global]
Arguments dep_option_none {_} {_} {_} (_).

Definition wrap_dep_option_eq {t : Type} (x : option t) :
  dep_option
    t
    (fun y => x = Some y)
    (x = None)
:=
  match x as x' return x = x' -> _ with
  | Some x' => fun hyp =>
    dep_option_some x' hyp
  | None => fun hyp =>
    dep_option_none hyp
  end eq_refl
.

Fixpoint power_of_2'' (x : nat) (acc : Acc Nat.lt x) : bool.
  refine (
    if Nat.eq_dec x 0
    then (* if x = 0 then x is not a power of 2 *)
      false
    else
      if Nat.eq_dec x 1
      then (* if x = 1 then x is a power of 2 *)
        true
      else
        match wrap_dep_option_eq (half x) with
        | dep_option_some y _ =>
          power_of_2'' y (Acc_inv acc _)
        | dep_option_none _ =>
          false
        end
  ).
  apply half_lt; auto.
Defined.

Lemma power_of_2''_true :
  forall x : nat,
  forall acc : Acc Nat.lt x,
  power_of_2'' x acc = true ->
    exists e : nat, Nat.pow 2 e = x
.
  induction x as [x ih] using (well_founded_ind Wf_nat.lt_wf).
  intros [acc] is_true; simpl in *.
  destruct (Nat.eq_dec x 0) as [| h];
    [congruence |].
  destruct (Nat.eq_dec x 1) as [h' | h'].
  - exists 0; auto.
  - destruct (wrap_dep_option_eq (half x)) as [y h'' |];
      [| congruence].
    apply ih in is_true as [e].
    * apply half_some in h''.
      exists (S e).
      simpl; lia.
    * apply half_lt; auto.
Qed.
